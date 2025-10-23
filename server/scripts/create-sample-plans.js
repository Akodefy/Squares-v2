const mongoose = require('mongoose');
const Plan = require('../models/Plan');
require('dotenv').config();

const { connectDB } = require('../config/database');

const samplePlans = [
  {
    name: 'Basic Plan',
    description: 'Perfect for new agents getting started',
    price: 999,
    currency: 'INR',
    billingPeriod: 'monthly',
    features: [
      'Up to 10 property listings',
      'Basic lead management',
      'Email support',
      'Standard property photos',
      'Basic analytics',
      'Property status updates'
    ],
    limits: {
      properties: 10,
      featuredListings: 0,
      photos: 15,
      videoTours: 0,
      leadManagement: 'basic',
      support: 'email'
    },
    isActive: true,
    isPopular: false,
    sortOrder: 1
  },
  {
    name: 'Premium Plan',
    description: 'Advanced features for professional agents',
    price: 2499,
    currency: 'INR',
    billingPeriod: 'monthly',
    features: [
      'Up to 50 property listings',
      'Advanced lead management',
      'Priority email & phone support',
      'HD property photos & videos',
      'Detailed analytics & insights',
      'Featured listings (5 per month)',
      'Custom property brochures',
      'Lead scoring & tracking'
    ],
    limits: {
      properties: 50,
      featuredListings: 5,
      photos: 50,
      videoTours: 3,
      leadManagement: 'advanced',
      support: 'priority'
    },
    isActive: true,
    isPopular: true,
    sortOrder: 2
  },
  {
    name: 'Enterprise Plan',
    description: 'Complete solution for large real estate businesses',
    price: 0, // Contact for pricing
    currency: 'INR',
    billingPeriod: 'monthly',
    features: [
      'Unlimited property listings',
      'Complete CRM integration',
      '24/7 dedicated support',
      'Professional photography service',
      'Advanced analytics & reports',
      'Unlimited featured listings',
      'Custom branding & themes',
      'API access',
      'Multi-user accounts',
      'White-label solutions',
      'Virtual tour creation',
      'Marketing automation'
    ],
    limits: {
      properties: 0, // unlimited
      featuredListings: 0, // unlimited
      photos: 0, // unlimited
      videoTours: 0, // unlimited
      leadManagement: 'enterprise',
      support: 'dedicated'
    },
    isActive: true,
    isPopular: false,
    sortOrder: 3
  }
];

async function createSamplePlans() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    // Create sample plans
    for (const planData of samplePlans) {
      const plan = new Plan(planData);
      await plan.save();
      console.log(`Created plan: ${plan.name}`);
    }

    console.log('Sample plans created successfully');
  } catch (error) {
    console.error('Error creating sample plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSamplePlans();
