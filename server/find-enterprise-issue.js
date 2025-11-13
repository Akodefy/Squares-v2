const mongoose = require('mongoose');
require('dotenv').config();

async function findEnterpriseUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const Plan = require('./models/Plan');
    const User = require('./models/User');
    const Subscription = require('./models/Subscription');
    const Property = require('./models/Property');
    
    console.log('🔍 Finding Enterprise users with issues...');
    
    // Find users with enterprise subscriptions
    const enterpriseSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $gt: new Date() }
    })
    .populate('plan')
    .populate('user', 'email profile _id');
    
    const enterpriseUsers = enterpriseSubscriptions.filter(sub => 
      sub.plan && sub.plan.identifier === 'enterprise'
    );
    
    console.log(`\n📊 Found ${enterpriseUsers.length} enterprise users:`);
    
    for (const sub of enterpriseUsers) {
      const propertyCount = await Property.countDocuments({ owner: sub.user._id });
      console.log(`\nUser: ${sub.user.email}`);
      console.log(`  User ID: ${sub.user._id}`);
      console.log(`  Properties: ${propertyCount}`);
      console.log(`  Plan: ${sub.plan.name}`);
      console.log(`  Plan Properties Limit: ${sub.plan.limits?.properties}`);
      
      if (propertyCount >= 5) {
        console.log(`  ⚠️  This user has ${propertyCount} properties (5+ issue) - Testing...`);
        
        // Test the API logic for this user
        const vendorId = sub.user._id.toString();
        
        // Get active subscription (using the same logic as API)
        const activeSubscription = await Subscription.findOne({
          user: vendorId,
          status: 'active',
          endDate: { $gt: new Date() }
        }).populate('plan').sort({ createdAt: -1 });

        if (activeSubscription && activeSubscription.plan) {
          const plan = activeSubscription.plan;
          const propertyLimit = plan.limits?.properties !== undefined ? plan.limits.properties : 5;
          const maxProperties = propertyLimit === 0 ? 999999 : propertyLimit;
          const canAddMore = propertyCount < maxProperties;
          
          console.log(`    API would return:`);
          console.log(`      maxProperties: ${maxProperties}`);
          console.log(`      currentProperties: ${propertyCount}`);
          console.log(`      canAddMore: ${canAddMore}`);
          
          if (!canAddMore && maxProperties !== 999999) {
            console.log(`    🚨 FOUND THE BUG! This user should have unlimited but API says NO`);
            console.log(`       Plan Limit Raw: ${plan.limits?.properties}`);
            console.log(`       Plan Limit Type: ${typeof plan.limits?.properties}`);
            console.log(`       Plan Object:`, JSON.stringify(plan.limits, null, 4));
          }
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findEnterpriseUser();
