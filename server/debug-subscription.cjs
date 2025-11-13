const mongoose = require('mongoose');
require('dotenv').config();

async function debugSubscriptionLimits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Subscription = require('./models/Subscription');
    const Property = require('./models/Property');
    const User = require('./models/User');
    const Plan = require('./models/Plan');

    // Find enterprise subscriptions
    const activeSubscriptions = await Subscription.find({ 
      status: 'active',
      endDate: { $gt: new Date() }
    })
    .populate('plan')
    .populate('user', 'email');

    console.log('Found', activeSubscriptions.length, 'active subscriptions');
    
    for (const sub of activeSubscriptions) {
      if (sub.plan?.identifier === 'enterprise') {
        console.log('\n=== ENTERPRISE SUBSCRIPTION DEBUG ===');
        console.log('User email:', sub.user?.email);
        console.log('Plan name:', sub.plan?.name);
        console.log('Plan identifier:', sub.plan?.identifier);
        
        // Get the properties limit
        const propertiesLimit = sub.plan?.limits?.properties;
        console.log('Plan properties limit (raw):', propertiesLimit);
        console.log('Properties limit type:', typeof propertiesLimit);
        console.log('Properties limit === 0:', propertiesLimit === 0);
        console.log('Properties limit || 5:', propertiesLimit || 5);
        
        // Count current properties for this user
        const currentProperties = await Property.countDocuments({ owner: sub.user._id });
        console.log('Current properties count:', currentProperties);
        
        // Apply API logic
        const propertyLimit = sub.plan.limits?.properties || 5;
        const maxProperties = propertyLimit === 0 ? 999999 : propertyLimit;
        const canAddMore = currentProperties < maxProperties;
        
        console.log('Calculated max properties:', maxProperties);
        console.log('Can add more:', canAddMore);
        
        console.log('===================================\n');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

debugSubscriptionLimits();
