const mongoose = require('mongoose');
require('dotenv').config();

async function debugSubscriptionPlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const Plan = require('./server/models/Plan');
    const Subscription = require('./server/models/Subscription');
    const User = require('./server/models/User');
    
    console.log('\n📋 Current Subscription Plans in Database:');
    console.log('============================================');
    
    // Get all plans from database
    const plans = await Plan.find({}).sort({ sortOrder: 1 });
    
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   ID: ${plan._id}`);
      console.log(`   Identifier: ${plan.identifier}`);
      console.log(`   Price: ₹${plan.price}`);
      console.log(`   Description: ${plan.description}`);
      console.log(`   Properties Limit: ${plan.limits?.properties} ${plan.limits?.properties === 0 ? '(Unlimited)' : ''}`);
      console.log(`   Features: ${plan.features?.map(f => typeof f === 'string' ? f : f.name).join(', ')}`);
      console.log(`   Is Active: ${plan.isActive}`);
      console.log('   ---');
    });
    
    if (plans.length === 0) {
      console.log('❌ No plans found in database!');
      return;
    }
    
    // Find Enterprise plan specifically
    const enterprisePlan = plans.find(p => 
      p.identifier === 'enterprise' || 
      p.name.toLowerCase().includes('enterprise')
    );
    
    if (enterprisePlan) {
      console.log('\n🎯 Enterprise Plan Details:');
      console.log('===========================');
      console.log(`Name: ${enterprisePlan.name}`);
      console.log(`Identifier: ${enterprisePlan.identifier}`);
      console.log(`Price: ₹${enterprisePlan.price}`);
      console.log(`Properties Limit: ${enterprisePlan.limits?.properties} ${enterprisePlan.limits?.properties === 0 ? '(Should be UNLIMITED)' : ''}`);
      console.log(`Features:`, enterprisePlan.features);
      console.log(`Limits:`, JSON.stringify(enterprisePlan.limits, null, 2));
    } else {
      console.log('\n❌ No Enterprise plan found!');
    }
    
    // Check active subscriptions for enterprise users
    console.log('\n💰 Active Enterprise Subscriptions:');
    console.log('====================================');
    
    const activeEnterpriseSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $gt: new Date() }
    })
    .populate('plan')
    .populate('user', 'email profile.firstName profile.lastName');
    
    const enterpriseSubscriptions = activeEnterpriseSubscriptions.filter(sub => 
      sub.plan && (
        sub.plan.identifier === 'enterprise' || 
        sub.plan.name.toLowerCase().includes('enterprise')
      )
    );
    
    if (enterpriseSubscriptions.length > 0) {
      enterpriseSubscriptions.forEach((sub, index) => {
        console.log(`${index + 1}. User: ${sub.user?.email} (${sub.user?.profile?.firstName} ${sub.user?.profile?.lastName})`);
        console.log(`   Plan: ${sub.plan?.name} (₹${sub.plan?.price})`);
        console.log(`   Properties Limit: ${sub.plan?.limits?.properties} ${sub.plan?.limits?.properties === 0 ? '(UNLIMITED)' : ''}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   End Date: ${sub.endDate}`);
        console.log('   ---');
      });
    } else {
      console.log('❌ No active Enterprise subscriptions found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugSubscriptionPlan();
