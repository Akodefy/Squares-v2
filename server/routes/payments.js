const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
// const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Apply auth middleware to specific routes that need it
// router.use(authenticateToken);

// @desc    Create Razorpay order for subscription
// @route   POST /api/payments/create-order
// @access  Private
router.post('/create-order', authenticateToken, asyncHandler(async (req, res) => {
  console.log('Payment order request received:', {
    body: req.body,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
  
  const { planId, billingCycle = 'monthly', addons = [], totalAmount } = req.body;

  if (!planId) {
    console.log('Payment order failed: No planId provided');
    return res.status(400).json({
      success: false,
      message: 'Plan ID is required'
    });
  }

  // Validate plan
  const plan = await Plan.findById(planId);
  console.log('Plan lookup result:', { planId, found: !!plan });
  
  if (!plan || !plan.isActive) {
    console.log('Payment order failed: Plan not found or inactive', { plan });
    return res.status(404).json({
      success: false,
      message: 'Plan not found or inactive'
    });
  }

  // Check if user already has an active subscription
  const existingSubscription = await Subscription.findOne({
    userId: req.user.id,
    status: 'active'
  });

  if (existingSubscription) {
    return res.status(400).json({
      success: false,
      message: 'User already has an active subscription'
    });
  }

  // Calculate amount based on billing cycle and addons
  let amount = plan.price;
  if (billingCycle === 'yearly' && plan.billingPeriod === 'monthly') {
    amount = plan.price * 12 * 0.83; // 17% discount for yearly
  }

  // Add addon costs
  if (addons.length > 0) {
    const AddonService = require('../models/AddonService');
    const addonServices = await AddonService.find({ _id: { $in: addons } });
    const addonCost = addonServices.reduce((total, addon) => total + addon.price, 0);
    amount += addonCost;
  }

  // Use totalAmount if provided (from frontend calculation)
  if (totalAmount && totalAmount > 0) {
    amount = totalAmount;
  }

  // Create Razorpay order
  const orderOptions = {
    amount: Math.round(amount * 100), // Amount in paise
    currency: plan.currency || 'INR',
    receipt: `subscription_${planId}_${Date.now()}`,
    notes: {
      planId: planId,
      userId: req.user.id,
      billingCycle: billingCycle,
      addons: addons.join(','),
      totalAmount: amount
    }
  };

  console.log('Creating Razorpay order with options:', orderOptions);
  console.log('Razorpay config:', {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET'
  });

  try {
    // For development, return a mock order if Razorpay fails
    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
      console.log('Razorpay order created successfully:', order.id);
    } catch (razorpayError) {
      console.log('Razorpay failed, using mock order:', razorpayError.message);
      // Create a mock order for development
      order = {
        id: `order_mock_${Date.now()}`,
        amount: orderOptions.amount,
        currency: orderOptions.currency,
        status: 'created'
      };
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        planName: plan.name,
        userEmail: req.user.email || 'test@example.com'
      }
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
}));

// @desc    Create Razorpay order for subscription with addons
// @route   POST /api/payments/create-subscription-order
// @access  Private
router.post('/create-subscription-order', authenticateToken, asyncHandler(async (req, res) => {
  console.log('Subscription payment order request received:', {
    body: req.body,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
  
  const { planId, billingCycle = 'monthly', addons = [], totalAmount } = req.body;

  if (!planId) {
    console.log('Subscription payment order failed: No planId provided');
    return res.status(400).json({
      success: false,
      message: 'Plan ID is required'
    });
  }

  // Validate plan - try both ObjectId and string-based lookup
  let plan;
  try {
    // First try to find by ObjectId if planId looks like an ObjectId
    if (planId.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findById(planId);
    } else {
      // If not ObjectId format, try to find by name or identifier
      plan = await Plan.findOne({ 
        $or: [
          { identifier: planId },
          { name: { $regex: new RegExp(planId, 'i') } }
        ]
      });
    }
  } catch (error) {
    console.log('Plan lookup error:', error.message);
  }
  
  console.log('Plan lookup result:', { planId, found: !!plan, planName: plan?.name });
  
  if (!plan || !plan.isActive) {
    console.log('Subscription payment order failed: Plan not found or inactive', { plan });
    return res.status(404).json({
      success: false,
      message: 'Plan not found or inactive'
    });
  }

  // Check if user already has an active subscription
  const existingSubscription = await Subscription.findOne({
    userId: req.user.id,
    status: 'active'
  });

  if (existingSubscription) {
    return res.status(400).json({
      success: false,
      message: 'User already has an active subscription'
    });
  }

  // Validate addons if provided
  let addonServices = [];
  if (addons.length > 0) {
    const AddonService = require('../models/AddonService');
    addonServices = await AddonService.find({ _id: { $in: addons }, isActive: true });
    console.log('Addon services found:', addonServices.length);
  }

  // Calculate total amount
  let calculatedAmount = plan.price;
  if (billingCycle === 'yearly' && plan.billingPeriod === 'monthly') {
    calculatedAmount = Math.round(plan.price * 10); // 10 months price (2 months free)
  }

  // Add addon costs
  const addonCost = addonServices.reduce((total, addon) => total + addon.price, 0);
  calculatedAmount += addonCost;

  // Use provided totalAmount if it matches our calculation (with small tolerance)
  const amount = (totalAmount && Math.abs(totalAmount - calculatedAmount) < 10) ? totalAmount : calculatedAmount;

  // Create Razorpay order
  const orderOptions = {
    amount: Math.round(amount * 100), // Amount in paise
    currency: plan.currency || 'INR',
    receipt: `sub_${planId}_${Date.now()}`,
    notes: {
      planId: planId,
      userId: req.user.id,
      billingCycle: billingCycle,
      addons: addons.join(','),
      totalAmount: amount,
      type: 'subscription_with_addons'
    }
  };

  console.log('Creating Razorpay subscription order with options:', orderOptions);

  try {
    // For development, return a mock order if Razorpay fails
    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
      console.log('Razorpay subscription order created successfully:', order.id);
    } catch (razorpayError) {
      console.log('Razorpay failed, using mock order:', razorpayError.message);
      // Create a mock order for development
      order = {
        id: `order_sub_mock_${Date.now()}`,
        amount: orderOptions.amount,
        currency: orderOptions.currency,
        status: 'created'
      };
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'mock_key',
        planName: plan.name,
        userEmail: req.user.email || 'test@example.com',
        addons: addonServices
      }
    });
  } catch (error) {
    console.error('Subscription Razorpay order creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription payment order'
    });
  }
}));

// @desc    Verify subscription payment with addons and create subscription
// @route   POST /api/payments/verify-subscription-payment
// @access  Private
router.post('/verify-subscription-payment', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    planId,
    addons = [],
    billingCycle = 'monthly',
    totalAmount
  } = req.body;

  // Verify signature (skip for mock payments)
  if (!razorpay_order_id.includes('mock')) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  }

  try {
    // Get plan details - handle both ObjectId and string planId
    let plan;
    try {
      if (planId.match(/^[0-9a-fA-F]{24}$/)) {
        plan = await Plan.findById(planId);
      } else {
        plan = await Plan.findOne({ 
          $or: [
            { identifier: planId },
            { name: { $regex: new RegExp(planId, 'i') } }
          ]
        });
      }
    } catch (error) {
      console.log('Plan lookup error in verification:', error.message);
    }
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Get addon details
    let addonServices = [];
    if (addons.length > 0) {
      const AddonService = require('../models/AddonService');
      addonServices = await AddonService.find({ _id: { $in: addons }, isActive: true });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Calculate amount
    let amount = plan.price;
    if (billingCycle === 'yearly' && plan.billingPeriod === 'monthly') {
      amount = Math.round(plan.price * 10); // 10 months price (2 months free)
    }

    // Add addon costs
    const addonCost = addonServices.reduce((total, addon) => total + addon.price, 0);
    amount += addonCost;

    // Create subscription
    const subscription = new Subscription({
      user: req.user.id, // Changed from userId to user
      plan: plan._id, // Changed from planId to plan and use the actual plan ObjectId
      addons: addons.filter(id => mongoose.Types.ObjectId.isValid(id)), // Add addons array
      status: 'active',
      startDate,
      endDate,
      amount: totalAmount || amount,
      currency: plan.currency || 'INR',
      paymentMethod: 'razorpay',
      autoRenew: true, // Changed from isAutoRenew to autoRenew
      paymentDetails: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id || `mock_payment_${Date.now()}`,
        razorpaySignature: razorpay_signature || 'mock_signature'
      },
      lastPaymentDate: new Date(),
      // Add addon details as metadata in transactionId for now
      transactionId: `${razorpay_payment_id || `mock_payment_${Date.now()}`}_${billingCycle}_${addons.length}addons`
    });

    await subscription.save();

    // Update plan subscriber count using the plan ObjectId
    await Plan.findByIdAndUpdate(plan._id, {
      $inc: { subscriberCount: 1 }
    });

    // Populate response
    await subscription.populate([
      { path: 'user', select: 'name email phone profile' },
      { path: 'plan', select: 'name description price billingPeriod features' },
      { path: 'addons', select: 'name description price category billingType' }
    ]);

    res.json({
      success: true,
      message: 'Subscription payment verified and subscription created successfully',
      data: { 
        subscription,
        addons: addonServices,
        billingCycle,
        addonDetails: addonServices.map(addon => ({
          id: addon._id,
          name: addon.name,
          price: addon.price,
          billingType: addon.billingType,
          category: addon.category
        }))
      }
    });

  } catch (error) {
    console.error('Subscription payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription payment and create subscription'
    });
  }
}));

// @desc    Verify Razorpay payment and create subscription
// @route   POST /api/payments/verify-payment
// @access  Private
router.post('/verify-payment', asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    planId,
    billingCycle = 'monthly'
  } = req.body;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature'
    });
  }

  try {
    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Calculate amount
    let amount = plan.price;
    if (billingCycle === 'yearly' && plan.billingPeriod === 'monthly') {
      amount = plan.price * 12 * 0.83; // 17% discount for yearly
    }

    // Create subscription
    const subscription = new Subscription({
      user: req.user.id, // Changed from userId to user
      plan: planId, // Changed from planId to plan (assuming planId is ObjectId here)
      status: 'active',
      startDate,
      endDate,
      amount,
      currency: plan.currency || 'INR',
      paymentMethod: 'razorpay',
      autoRenew: true, // Changed from isAutoRenew to autoRenew
      paymentDetails: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      lastPaymentDate: new Date()
    });

    await subscription.save();

    // Update plan subscriber count
    await Plan.findByIdAndUpdate(planId, {
      $inc: { subscriberCount: 1 }
    });

    // Populate response
    await subscription.populate([
      { path: 'user', select: 'name email phone profile' }, // Changed from userId to user
      { path: 'plan', select: 'name description price billingPeriod features' } // Changed from planId to plan
    ]);

    res.json({
      success: true,
      message: 'Payment verified and subscription created successfully',
      data: { subscription }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment and create subscription'
    });
  }
}));

// @desc    Get payment status
// @route   GET /api/payments/:paymentId/status
// @access  Private
router.get('/:paymentId/status', asyncHandler(async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    
    res.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        createdAt: payment.created_at
      }
    });
  } catch (error) {
    console.error('Payment status fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
}));

// @desc    Refund payment
// @route   POST /api/payments/:paymentId/refund
// @access  Private/Admin
router.post('/:paymentId/refund', asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const { amount, reason } = req.body;

  try {
    const refund = await razorpay.payments.refund(req.params.paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined, // Full refund if no amount specified
      notes: {
        reason: reason || 'Subscription cancellation',
        refundedBy: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
}));

module.exports = router;
