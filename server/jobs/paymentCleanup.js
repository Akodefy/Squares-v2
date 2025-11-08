/**
 * Payment Cleanup Job
 * 
 * This job runs periodically to:
 * 1. Check for pending payments that have exceeded Razorpay's 15-minute timeout
 * 2. Mark them as cancelled
 * 3. Update associated subscriptions
 * 
 * Razorpay automatically expires payment sessions after 15 minutes.
 * This job ensures our database stays in sync.
 */

const paymentStatusService = require('../services/paymentStatusService');

class PaymentCleanupJob {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Start the periodic cleanup job
   * @param {number} intervalMinutes - How often to run (default: 5 minutes)
   */
  start(intervalMinutes = 5) {
    if (this.intervalId) {
      console.log('[Payment Cleanup Job] Already running');
      return;
    }

    console.log(`[Payment Cleanup Job] Starting - will run every ${intervalMinutes} minutes`);
    
    // Run immediately on startup
    this.run();
    
    // Schedule periodic runs
    this.intervalId = setInterval(() => {
      this.run();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Run the cleanup job
   */
  async run() {
    if (this.isRunning) {
      console.log('[Payment Cleanup Job] Skipping - previous job still running');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('[Payment Cleanup Job] Starting cleanup at', new Date().toISOString());
      
      const result = await paymentStatusService.checkExpiredPayments();
      
      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log('[Payment Cleanup Job] Completed successfully:', {
          duration: `${duration}ms`,
          totalExpired: result.totalExpired,
          updated: result.updatedCount,
          timestamp: result.timestamp
        });

        if (result.updatedCount > 0) {
          console.log('[Payment Cleanup Job] Cancelled payments:', 
            result.results.map(r => ({
              paymentId: r.paymentId,
              orderId: r.orderId,
              amount: r.amount,
              minutesExpired: r.minutesExpired
            }))
          );
        }
      } else {
        console.error('[Payment Cleanup Job] Failed:', result.error);
      }
    } catch (error) {
      console.error('[Payment Cleanup Job] Unexpected error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop the cleanup job
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Payment Cleanup Job] Stopped');
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isScheduled: !!this.intervalId,
      isRunning: this.isRunning
    };
  }
}

// Export singleton instance
module.exports = new PaymentCleanupJob();
