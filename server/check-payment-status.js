/**
 * Manual Payment Status Update Script
 * 
 * Use this script to manually check and update payment statuses
 * Useful for fixing pending payments that should be cancelled or failed
 * 
 * Usage:
 * node check-payment-status.js <paymentId>
 * node check-payment-status.js 68fa17dcf3f2fa10bad9baf5
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Subscription = require('./models/Subscription');
const paymentStatusService = require('./services/paymentStatusService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ninety-nine-acres';

async function checkPaymentStatus(paymentId) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find payment
    const payment = await Payment.findByIdentifier(paymentId);
    
    if (!payment) {
      console.error('❌ Payment not found:', paymentId);
      process.exit(1);
    }

    console.log('\n📋 Payment Details:');
    console.log('ID:', payment._id.toString());
    console.log('Order ID:', payment.razorpayOrderId);
    console.log('Payment ID:', payment.razorpayPaymentId || 'N/A');
    console.log('Amount:', `₹${payment.amount}`);
    console.log('Status:', payment.status);
    console.log('Created:', payment.createdAt);
    console.log('Expires:', payment.expiresAt || 'N/A');
    console.log('Failure Reason:', payment.failureReason || 'N/A');

    // Calculate age
    const now = new Date();
    const age = now - new Date(payment.createdAt);
    const ageMinutes = Math.floor(age / 60000);
    const ageHours = Math.floor(age / 3600000);
    const ageDays = Math.floor(age / 86400000);

    console.log('\n⏱️ Payment Age:');
    console.log(`${ageDays} days, ${ageHours % 24} hours, ${ageMinutes % 60} minutes`);

    // Check if expired
    const razorpayTimeout = 15; // minutes
    if (payment.status === 'pending') {
      if (ageMinutes > razorpayTimeout) {
        console.log('\n⚠️  Payment has EXCEEDED Razorpay\'s 15-minute timeout!');
        console.log(`Payment is ${ageMinutes} minutes old (limit: ${razorpayTimeout} minutes)`);
        console.log('\n🔄 Marking payment as cancelled...');
        
        await payment.markAsCancelled(
          `Payment timeout - exceeded Razorpay's ${razorpayTimeout}-minute limit (${ageMinutes} minutes elapsed)`
        );
        
        // Update subscription if linked
        if (payment.subscription) {
          await Subscription.findByIdAndUpdate(payment.subscription, {
            status: 'cancelled',
            cancellationReason: 'Payment timeout'
          });
          console.log('✅ Subscription also cancelled');
        }
        
        console.log('✅ Payment status updated to: cancelled');
      } else {
        const remaining = razorpayTimeout - ageMinutes;
        console.log(`\n✓ Payment still within timeout window (${remaining} minutes remaining)`);
      }
    } else {
      console.log(`\n✓ Payment is already ${payment.status}`);
    }

    // Show updated status
    const updatedPayment = await Payment.findById(payment._id);
    console.log('\n📊 Final Status:', updatedPayment.status);
    console.log('Failure Reason:', updatedPayment.failureReason || 'N/A');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

async function checkAllExpiredPayments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Checking for expired pending payments...\n');
    
    const result = await paymentStatusService.checkExpiredPayments();
    
    if (result.success) {
      console.log('✅ Cleanup completed successfully');
      console.log('Total expired payments found:', result.totalExpired);
      console.log('Payments updated:', result.updatedCount);
      
      if (result.results && result.results.length > 0) {
        console.log('\n📋 Updated Payments:');
        result.results.forEach((r, i) => {
          console.log(`\n${i + 1}. Payment ID: ${r.paymentId}`);
          console.log(`   Order ID: ${r.orderId}`);
          console.log(`   Amount: ₹${r.amount}`);
          console.log(`   Minutes Expired: ${r.minutesExpired}`);
          console.log(`   New Status: ${r.status}`);
        });
      }
    } else {
      console.error('❌ Cleanup failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔍 Checking ALL expired payments...');
  checkAllExpiredPayments();
} else if (args[0] === '--all') {
  console.log('🔍 Checking ALL expired payments...');
  checkAllExpiredPayments();
} else {
  const paymentId = args[0];
  console.log(`🔍 Checking payment: ${paymentId}`);
  checkPaymentStatus(paymentId);
}
