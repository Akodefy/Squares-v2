/**
 * Razorpay Webhook Handler
 * 
 * Handles webhook events from Razorpay for:
 * - payment.failed
 * - payment.authorized
 * - payment.captured
 * - order.paid
 * 
 * This ensures real-time updates when payments fail or succeed
 */

const express = require('express');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const paymentStatusService = require('../services/paymentStatusService');

const router = express.Router();

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body, signature, secret) {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('[Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * @desc    Handle Razorpay webhooks
 * @route   POST /api/webhooks/razorpay
 * @access  Public (but verified with signature)
 */
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (!signature) {
    console.warn('[Webhook] Missing signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  // Verify signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (error) {
    console.error('[Webhook] Invalid JSON:', error);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const isValid = verifyWebhookSignature(body, signature, webhookSecret);
  
  if (!isValid) {
    console.warn('[Webhook] Invalid signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { event, payload } = body;
  
  console.log('[Webhook] Received event:', event, 'for payment:', payload?.payment?.entity?.id);

  try {
    switch (event) {
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;
      
      case 'payment.authorized':
        await handlePaymentAuthorized(payload);
        break;
      
      case 'order.paid':
        await handleOrderPaid(payload);
        break;
      
      default:
        console.log('[Webhook] Unhandled event:', event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payload) {
  const paymentEntity = payload.payment.entity;
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;
  const errorDescription = paymentEntity.error_description || 
                          paymentEntity.error_reason || 
                          'Payment failed during processing';

  console.log('[Webhook] Payment failed:', {
    orderId,
    paymentId,
    error: errorDescription
  });

  // Find and update payment
  const payment = await Payment.findOne({
    $or: [
      { razorpayOrderId: orderId },
      { razorpayPaymentId: paymentId }
    ]
  });

  if (payment && payment.status === 'pending') {
    await payment.markAsFailed(errorDescription);
    
    // Update subscription if linked
    if (payment.subscription) {
      await Subscription.findByIdAndUpdate(payment.subscription, {
        status: 'cancelled',
        cancellationReason: `Payment failed: ${errorDescription}`
      });
    }
    
    console.log('[Webhook] Payment marked as failed:', payment._id);
  } else {
    console.warn('[Webhook] Payment not found or not pending:', orderId);
  }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payload) {
  const paymentEntity = payload.payment.entity;
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;

  console.log('[Webhook] Payment captured:', {
    orderId,
    paymentId,
    amount: paymentEntity.amount / 100
  });

  // Find and update payment
  const payment = await Payment.findOne({
    $or: [
      { razorpayOrderId: orderId },
      { razorpayPaymentId: paymentId }
    ]
  });

  if (payment && payment.status === 'pending') {
    payment.status = 'paid';
    payment.razorpayPaymentId = paymentId;
    await payment.save();
    
    // Update subscription if linked
    if (payment.subscription) {
      await Subscription.findByIdAndUpdate(payment.subscription, {
        status: 'active'
      });
    }
    
    console.log('[Webhook] Payment marked as paid:', payment._id);
  }
}

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(payload) {
  const paymentEntity = payload.payment.entity;
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;

  console.log('[Webhook] Payment authorized:', {
    orderId,
    paymentId
  });

  // Update payment with payment ID if found
  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (payment && payment.status === 'pending') {
    payment.razorpayPaymentId = paymentId;
    await payment.save();
    console.log('[Webhook] Payment ID updated:', payment._id);
  }
}

/**
 * Handle order.paid event
 */
async function handleOrderPaid(payload) {
  const orderEntity = payload.order.entity;
  const orderId = orderEntity.id;

  console.log('[Webhook] Order paid:', orderId);

  // This is a fallback handler
  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (payment && payment.status === 'pending') {
    payment.status = 'paid';
    await payment.save();
    
    if (payment.subscription) {
      await Subscription.findByIdAndUpdate(payment.subscription, {
        status: 'active'
      });
    }
    
    console.log('[Webhook] Payment marked as paid via order.paid:', payment._id);
  }
}

module.exports = router;
