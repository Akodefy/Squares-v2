const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
require('dotenv').config();

const checkSubscriptionRevenue = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get all subscriptions
    const subscriptions = await Subscription.find({})
      .populate('user', 'email profile.firstName profile.lastName')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${subscriptions.length} subscriptions in database:`);
    
    if (subscriptions.length === 0) {
      console.log('ℹ️  No subscriptions found in database');
    } else {
      let totalRevenue = 0;
      let thisMonthRevenue = 0;
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      subscriptions.forEach((subscription, index) => {
        console.log(`\n${index + 1}. Subscription:`);
        console.log(`   User: ${subscription.user?.profile?.firstName} ${subscription.user?.profile?.lastName} (${subscription.user?.email})`);
        console.log(`   Plan: ${subscription.plan?.name || 'Unknown'} - ₹${subscription.amount}`);
        console.log(`   Status: ${subscription.status}`);
        console.log(`   Payment Date: ${subscription.lastPaymentDate || 'Not paid'}`);
        console.log(`   Created: ${subscription.createdAt}`);

        // Calculate revenue for active/expired subscriptions that have been paid
        if (['active', 'expired'].includes(subscription.status) && subscription.lastPaymentDate) {
          totalRevenue += subscription.amount;
          
          // Check if payment was this month
          if (subscription.lastPaymentDate >= firstDayOfMonth) {
            thisMonthRevenue += subscription.amount;
          }
        }
      });

      console.log(`\n💰 Revenue Summary:`);
      console.log(`   Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
      console.log(`   This Month Revenue: ₹${thisMonthRevenue.toLocaleString('en-IN')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Check if script is being run directly
if (require.main === module) {
  checkSubscriptionRevenue();
}

module.exports = checkSubscriptionRevenue;