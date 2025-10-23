const mongoose = require('mongoose');
const Plan = require('../models/Plan');
require('dotenv').config();

const updatePlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/squares');
    console.log('Connected to MongoDB');

    // Define the plans with proper identifiers
    const plansData = [
      {
        identifier: 'basic',
        name: 'Basic',
        description: 'Perfect for getting started',
        price: 999,
        currency: 'INR',
        billingPeriod: 'monthly',
        isActive: true,
        features: [
          'Up to 10 property listings',
          'Basic analytics',
          'Email support',
          'Mobile app access',
          'Standard templates'
        ],
        limits: {
          properties: 10,
          photos: 5,
          videos: 0,
          virtualTours: 0
        }
      },
      {
        identifier: 'premium',
        name: 'Premium',
        description: 'Most popular choice for growing businesses',
        price: 2499,
        currency: 'INR',
        billingPeriod: 'monthly',
        isActive: true,
        isPopular: true,
        features: [
          'Up to 50 property listings',
          'Advanced analytics & insights',
          'Priority support',
          'Custom branding',
          'Lead management',
          'Virtual tour integration',
          'SEO optimization'
        ],
        limits: {
          properties: 50,
          photos: 20,
          videos: 5,
          virtualTours: 10
        }
      },
      {
        identifier: 'enterprise',
        name: 'Enterprise',
        description: 'For large-scale operations',
        price: 0, // Contact based
        currency: 'INR',
        billingPeriod: 'monthly',
        isActive: true,
        features: [
          'Unlimited property listings',
          'Custom reporting',
          'Dedicated account manager',
          'API access',
          'White-label solution',
          'Advanced integrations',
          'Custom features'
        ],
        limits: {
          properties: -1, // Unlimited
          photos: -1,
          videos: -1,
          virtualTours: -1
        }
      }
    ];

    // Update or create plans
    for (const planData of plansData) {
      const existingPlan = await Plan.findOne({ identifier: planData.identifier });
      
      if (existingPlan) {
        await Plan.findByIdAndUpdate(existingPlan._id, planData);
        console.log(`Updated plan: ${planData.name}`);
      } else {
        await Plan.create(planData);
        console.log(`Created plan: ${planData.name}`);
      }
    }

    console.log('Plans updated successfully');
    
    // Show final plans
    const finalPlans = await Plan.find({}).select('identifier name price isActive');
    console.log('Final plans:', finalPlans);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating plans:', error);
    process.exit(1);
  }
};

updatePlans();
