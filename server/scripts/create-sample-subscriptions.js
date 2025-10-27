require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createSamplePlansAndSubscriptions() {
  try {
    console.log('Creating sample plans and subscriptions...');

    // First, create sample plans if they don't exist
    const plans = [
      {
        identifier: 'basic',
        name: 'Basic Plan',
        description: 'Perfect for individual agents starting out',
        price: 999,
        currency: 'INR',
        billingPeriod: 'monthly',
        features: [
          'Up to 10 property listings',
          'Basic analytics',
          'Email support',
          'Mobile app access'
        ],
        limits: {
          properties: 10,
          featuredListings: 2,
          photos: 15,
          videoTours: 1,
          leads: 50,
          messages: 200
        },
        isActive: true,
        sortOrder: 1
      },
      {
        identifier: 'professional',
        name: 'Professional Plan',
        description: 'For growing real estate businesses',
        price: 2499,
        currency: 'INR',
        billingPeriod: 'monthly',
        features: [
          'Up to 50 property listings',
          'Advanced analytics',
          'Priority support',
          'Mobile app access',
          'Featured listings',
          'Lead management tools'
        ],
        limits: {
          properties: 50,
          featuredListings: 10,
          photos: 25,
          videoTours: 5,
          leads: 200,
          messages: 1000
        },
        isActive: true,
        isPopular: true,
        sortOrder: 2
      },
      {
        identifier: 'enterprise',
        name: 'Enterprise Plan',
        description: 'For large real estate companies',
        price: 4999,
        currency: 'INR',
        billingPeriod: 'monthly',
        features: [
          'Unlimited property listings',
          'Advanced analytics & reporting',
          '24/7 phone support',
          'Mobile app access',
          'Featured listings',
          'Lead management tools',
          'Custom branding',
          'API access'
        ],
        limits: {
          properties: 0, // unlimited
          featuredListings: 0, // unlimited
          photos: 50,
          videoTours: 0, // unlimited
          leads: 0, // unlimited
          messages: 0 // unlimited
        },
        isActive: true,
        sortOrder: 3
      }
    ];

    // Create or update plans
    for (const planData of plans) {
      await Plan.findOneAndUpdate(
        { identifier: planData.identifier },
        planData,
        { upsert: true, new: true }
      );
      console.log(`✓ Created/Updated plan: ${planData.name}`);
    }

    // Get all vendor users (agents)
    const vendors = await User.find({ role: 'agent' }).select('_id email');
    console.log(`Found ${vendors.length} vendor users`);

    if (vendors.length === 0) {
      console.log('No vendor users found. Create some vendor users first.');
      return;
    }

    // Get the plans we just created
    const [basicPlan, professionalPlan, enterprisePlan] = await Promise.all([
      Plan.findOne({ identifier: 'basic' }),
      Plan.findOne({ identifier: 'professional' }),
      Plan.findOne({ identifier: 'enterprise' })
    ]);

    // Create subscriptions for vendors
    const subscriptionData = [];
    
    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      
      // Assign different plans to different vendors
      let selectedPlan;
      if (i % 3 === 0) {
        selectedPlan = basicPlan;
      } else if (i % 3 === 1) {
        selectedPlan = professionalPlan;
      } else {
        selectedPlan = enterprisePlan;
      }

      // Create subscription with various statuses
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60)); // Random start date within last 60 days
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      const status = i % 4 === 0 ? 'expired' : 'active'; // Make some expired for testing

      subscriptionData.push({
        user: vendor._id,
        plan: selectedPlan._id,
        status: status,
        startDate: startDate,
        endDate: endDate,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        billingCycle: selectedPlan.billingPeriod,
        autoRenew: Math.random() > 0.3, // 70% have auto-renew enabled
        paymentMethod: 'razorpay',
        transactionId: `txn_${Date.now()}_${i}`,
        addons: []
      });
    }

    // Delete existing subscriptions for these vendors to avoid duplicates
    await Subscription.deleteMany({ user: { $in: vendors.map(v => v._id) } });
    console.log('Cleared existing subscriptions');

    // Insert new subscriptions
    const createdSubscriptions = await Subscription.insertMany(subscriptionData);
    console.log(`✓ Created ${createdSubscriptions.length} sample subscriptions`);

    // Show summary
    const summary = await Subscription.aggregate([
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planInfo'
        }
      },
      {
        $unwind: '$planInfo'
      },
      {
        $group: {
          _id: {
            plan: '$planInfo.name',
            status: '$status'
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.plan': 1, '_id.status': 1 }
      }
    ]);

    console.log('\nSubscription Summary:');
    console.log('====================');
    summary.forEach(item => {
      console.log(`${item._id.plan} (${item._id.status}): ${item.count} subscriptions, ₹${item.totalRevenue} revenue`);
    });

    const totalRevenue = await Subscription.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    console.log(`\nTotal Revenue Generated: ₹${totalRevenue[0]?.total || 0}`);
    console.log('Sample subscriptions created successfully!');

  } catch (error) {
    console.error('Error creating sample subscriptions:', error);
  }
}

async function main() {
  await connectDB();
  await createSamplePlansAndSubscriptions();
  await mongoose.disconnect();
  console.log('Database connection closed');
}

main().catch(console.error);