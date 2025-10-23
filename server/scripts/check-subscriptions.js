require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');

const checkSubscriptions = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check both vendor emails
    const vendorEmails = ['vendor1@ninetyneacres.com', 'kanagaraj@gmail.com'];
    
    for (const email of vendorEmails) {
      console.log(`🔍 Checking subscriptions for: ${email}`);
      const user = await User.findOne({ email: email });
      
      if (user) {
        console.log(`   User ID: ${user._id}`);
        
        // Check subscriptions for this user
        const subscriptions = await Subscription.find({ user: user._id }).populate('plan');
        console.log(`   Subscriptions found: ${subscriptions.length}`);
        
        if (subscriptions.length > 0) {
          subscriptions.forEach((sub, index) => {
            console.log(`   Subscription ${index + 1}:`);
            console.log(`     Plan: ${sub.plan?.name || 'Unknown Plan'}`);
            console.log(`     Status: ${sub.status}`);
            console.log(`     Start Date: ${sub.startDate}`);
            console.log(`     End Date: ${sub.endDate}`);
            console.log(`     Is Active: ${sub.status === 'active' && new Date(sub.endDate) > new Date()}`);
          });
        } else {
          console.log('   No subscriptions found');
        }
      } else {
        console.log('❌ User not found');
      }
      console.log('-------------------------------------------\n');
    }

    // Check all subscriptions in database
    console.log('📋 All Subscriptions in Database:');
    const allSubscriptions = await Subscription.find({}).populate('plan').populate('user', 'email');
    console.log(`Total subscriptions: ${allSubscriptions.length}`);
    
    if (allSubscriptions.length > 0) {
      allSubscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. User: ${sub.user?.email || sub.user} - Plan: ${sub.plan?.name || 'Unknown'} - Status: ${sub.status} - Active: ${sub.status === 'active' && new Date(sub.endDate) > new Date()}`);
      });
    } else {
      console.log('   No subscriptions found in database');
    }

    // Check all plans
    console.log('\n📋 All Plans in Database:');
    const allPlans = await Plan.find({});
    console.log(`Total plans: ${allPlans.length}`);
    
    if (allPlans.length > 0) {
      allPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.name} - Price: ${plan.price} - Active: ${plan.isActive}`);
      });
    } else {
      console.log('   No plans found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n📡 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

checkSubscriptions();
