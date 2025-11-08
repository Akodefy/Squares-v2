#!/usr/bin/env node

/**
 * Manual script to check and update expired/failed payments
 * Usage: node check-payment-statuses.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Subscription = require('./models/Subscription');

const RAZORPAY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

async function checkAndUpdatePayments() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ninety-nine-acres');
    console.log('✅ Database connected\n');

    const now = new Date();
    
    // Find all pending payments
    const pendingPayments = await Payment.find({ status: 'pending' });
    console.log(`📊 Found ${pendingPayments.length} pending payments\n`);

    let expiredCount = 0;
    let activeCount = 0;

    for (const payment of pendingPayments) {
      const age = now - new Date(payment.createdAt);
      const ageMinutes = Math.floor(age / 60000);
      
      const isExpired = payment.expiresAt 
        ? now > new Date(payment.expiresAt)
        : age > RAZORPAY_TIMEOUT_MS;

      console.log(`\n💳 Payment ID: ${payment._id}`);
      console.log(`   Order ID: ${payment.razorpayOrderId}`);
      console.log(`   Amount: ${payment.currency} ${payment.amount}`);
      console.log(`   Created: ${payment.createdAt.toISOString()}`);
      console.log(`   Age: ${ageMinutes} minutes`);
      console.log(`   Status: ${payment.status}`);

      if (isExpired) {
        console.log(`   ⚠️  EXPIRED - Updating to cancelled...`);
        
        await payment.markAsCancelled('Payment timeout - exceeded Razorpay 15-minute limit');
        
        // Update linked subscription
        if (payment.subscription) {
          await Subscription.findByIdAndUpdate(payment.subscription, {
            status: 'cancelled',
            cancellationReason: 'Payment timeout'
          });
          console.log(`   📝 Updated linked subscription: ${payment.subscription}`);
        }
        
        expiredCount++;
      } else {
        const remainingMinutes = 15 - ageMinutes;
        console.log(`   ✅ Still active (${remainingMinutes} minutes remaining)`);
        activeCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total pending payments: ${pendingPayments.length}`);
    console.log(`   Expired and cancelled: ${expiredCount}`);
    console.log(`   Still active: ${activeCount}`);
    console.log('='.repeat(60) + '\n');

    // Show status breakdown
    const statusStats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('📈 Payment Status Breakdown:');
    statusStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} payments (Total: ${stat.totalAmount})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
    process.exit(0);
  }
}

// Run the script
checkAndUpdatePayments();
