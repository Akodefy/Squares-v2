const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

// Razorpay payment timeout: 15 minutes (900 seconds)
const RAZORPAY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

class PaymentStatusService {
  /**
   * Check and update expired pending payments
   * Automatically cancels payments that exceed Razorpay's 15-minute timeout
   */
  async checkExpiredPayments() {
    try {
      const now = new Date();
      
      // Find pending payments that have expired
      const expiredPayments = await Payment.find({
        status: 'pending',
        $or: [
          { expiresAt: { $lt: now } },
          { 
            expiresAt: { $exists: false },
            createdAt: { $lt: new Date(now - RAZORPAY_TIMEOUT_MS) }
          }
        ]
      });

      console.log(`[Payment Cleanup] Found ${expiredPayments.length} expired pending payments`);

      let updatedCount = 0;
      const results = [];
      
      for (const payment of expiredPayments) {
        try {
          const timeSinceCreation = now - new Date(payment.createdAt);
          const minutesExpired = Math.floor(timeSinceCreation / 60000);
          
          await payment.markAsCancelled(
            `Payment timeout - exceeded Razorpay's 15-minute limit (${minutesExpired} minutes elapsed)`
          );
          
          // Also update subscription if linked
          if (payment.subscription) {
            await Subscription.findByIdAndUpdate(payment.subscription, {
              status: 'cancelled',
              cancellationReason: 'Payment timeout - Payment not completed within time limit'
            });
          }
          
          results.push({
            paymentId: payment._id,
            orderId: payment.razorpayOrderId,
            amount: payment.amount,
            minutesExpired,
            status: 'cancelled'
          });
          
          updatedCount++;
          
          console.log(`[Payment Cleanup] Cancelled payment ${payment._id} (${minutesExpired} minutes old)`);
        } catch (err) {
          console.error(`[Payment Cleanup] Error cancelling payment ${payment._id}:`, err);
          results.push({
            paymentId: payment._id,
            error: err.message,
            status: 'error'
          });
        }
      }

      console.log(`[Payment Cleanup] Updated ${updatedCount}/${expiredPayments.length} expired payments to cancelled`);
      return { 
        success: true, 
        updatedCount, 
        totalExpired: expiredPayments.length,
        results,
        timestamp: now
      };
    } catch (error) {
      console.error('[Payment Cleanup] Error checking expired payments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify payment status with Razorpay and update if needed
   * Handles both failed and cancelled payment scenarios
   */
  async verifyPaymentStatus(paymentId, razorpay) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Skip verification for already completed/cancelled payments
      if (['paid', 'failed', 'cancelled', 'refunded'].includes(payment.status)) {
        return { success: true, status: payment.status, message: 'Payment already processed' };
      }

      // Check if payment has expired (beyond Razorpay timeout)
      if (payment.isExpired) {
        await payment.markAsCancelled(
          'Payment timeout - exceeded Razorpay\'s 15-minute limit'
        );
        
        // Update linked subscription
        if (payment.subscription) {
          await Subscription.findByIdAndUpdate(payment.subscription, {
            status: 'cancelled',
            cancellationReason: 'Payment timeout'
          });
        }
        
        return { success: true, status: 'cancelled', message: 'Payment expired and cancelled' };
      }

      // Verify with Razorpay if we have a payment ID and razorpay instance
      if (payment.razorpayPaymentId && razorpay) {
        try {
          const razorpayPayment = await razorpay.payments.fetch(payment.razorpayPaymentId);
          
          console.log(`[Payment Verification] Razorpay status for ${payment._id}:`, razorpayPayment.status);
          
          // Update based on Razorpay status
          if (razorpayPayment.status === 'captured') {
            payment.status = 'paid';
            await payment.save();
            
            // Update subscription status if linked
            if (payment.subscription) {
              await Subscription.findByIdAndUpdate(payment.subscription, {
                status: 'active'
              });
            }
            
            return { success: true, status: 'paid', message: 'Payment verified as successful' };
          } else if (razorpayPayment.status === 'failed') {
            const failureReason = razorpayPayment.error_description || 
                                 razorpayPayment.error_reason || 
                                 'Payment failed during processing';
            
            await payment.markAsFailed(failureReason);
            
            // Update subscription status if linked
            if (payment.subscription) {
              await Subscription.findByIdAndUpdate(payment.subscription, {
                status: 'cancelled',
                cancellationReason: `Payment failed: ${failureReason}`
              });
            }
            
            return { success: true, status: 'failed', message: 'Payment failed', reason: failureReason };
          } else if (razorpayPayment.status === 'authorized') {
            // Payment authorized but not captured yet - keep as pending
            return { success: true, status: 'pending', message: 'Payment authorized, awaiting capture' };
          }
        } catch (razorpayError) {
          console.error('[Payment Verification] Razorpay API error:', razorpayError);
          // Continue with timeout check
        }
      }

      return { success: true, status: payment.status, message: 'Payment status unchanged' };
    } catch (error) {
      console.error('[Payment Verification] Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark payment as failed (for webhook or manual failure handling)
   */
  async markPaymentFailed(orderId, paymentId, reason) {
    try {
      const payment = await Payment.findOne({
        $or: [
          { razorpayOrderId: orderId },
          { razorpayPaymentId: paymentId },
          { _id: paymentId }
        ]
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'pending') {
        return { 
          success: false, 
          message: `Payment already ${payment.status}`,
          currentStatus: payment.status 
        };
      }

      await payment.markAsFailed(reason || 'Payment failed during processing');
      
      // Update subscription if linked
      if (payment.subscription) {
        await Subscription.findByIdAndUpdate(payment.subscription, {
          status: 'cancelled',
          cancellationReason: `Payment failed: ${reason || 'Unknown reason'}`
        });
      }

      console.log(`[Payment Failed] Marked payment ${payment._id} as failed: ${reason}`);
      
      return {
        success: true,
        paymentId: payment._id,
        status: 'failed',
        message: 'Payment marked as failed',
        reason
      };
    } catch (error) {
      console.error('[Payment Failed] Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule periodic payment status checks
   * Runs automatically to clean up expired payments
   */
  startPeriodicCheck(intervalMinutes = 5) {
    console.log(`[Payment Service] Starting periodic payment status check (every ${intervalMinutes} minutes)`);
    
    // Run immediately on startup
    this.checkExpiredPayments();
    
    // Then run periodically
    const interval = setInterval(() => {
      console.log(`[Payment Service] Running periodic payment cleanup...`);
      this.checkExpiredPayments();
    }, intervalMinutes * 60 * 1000);

    return interval;
  }

  /**
   * Get payment statistics including status breakdown
   */
  async getPaymentStats() {
    try {
      const [stats, recentFailed, recentCancelled] = await Promise.all([
        Payment.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          }
        ]),
        Payment.find({ status: 'failed' })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('_id razorpayOrderId amount failureReason createdAt'),
        Payment.find({ status: 'cancelled' })
          .sort({ updatedAt: -1 })
          .limit(10)
          .select('_id razorpayOrderId amount failureReason createdAt updatedAt')
      ]);

      // Calculate timeout rate
      const cancelledDueToTimeout = await Payment.countDocuments({
        status: 'cancelled',
        failureReason: { $regex: /timeout|exceeded/i }
      });

      return { 
        success: true, 
        stats,
        recentFailed,
        recentCancelled,
        cancelledDueToTimeout,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('[Payment Stats] Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get specific payment status with detailed information
   */
  async getDetailedPaymentStatus(paymentIdentifier) {
    try {
      const payment = await Payment.findOne({
        $or: [
          { _id: paymentIdentifier },
          { razorpayOrderId: paymentIdentifier },
          { razorpayPaymentId: paymentIdentifier }
        ]
      }).populate('subscription user');

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      const now = new Date();
      const createdAt = new Date(payment.createdAt);
      const timeSinceCreation = now - createdAt;
      const minutesSinceCreation = Math.floor(timeSinceCreation / 60000);

      return {
        success: true,
        payment: {
          id: payment._id,
          orderId: payment.razorpayOrderId,
          paymentId: payment.razorpayPaymentId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          type: payment.type,
          description: payment.description,
          failureReason: payment.failureReason,
          createdAt: payment.createdAt,
          expiresAt: payment.expiresAt,
          isExpired: payment.isExpired,
          minutesSinceCreation,
          timeRemaining: payment.expiresAt 
            ? Math.max(0, Math.floor((new Date(payment.expiresAt) - now) / 60000))
            : 0
        }
      };
    } catch (error) {
      console.error('[Payment Details] Error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PaymentStatusService();
