const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  billingPeriod: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'lifetime']
  },
  features: [{
    type: String,
    required: true
  }],
  limits: {
    properties: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    featuredListings: {
      type: Number,
      default: 0
    },
    photos: {
      type: Number,
      default: 10
    },
    videoTours: {
      type: Number,
      default: 0
    },
    leads: {
      type: Number,
      default: 100 // Monthly lead limit
    },
    messages: {
      type: Number,
      default: 1000 // Monthly message limit
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for subscriber count
planSchema.virtual('subscriberCount', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'plan',
  count: true
});

planSchema.set('toJSON', { virtuals: true });
planSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Plan', planSchema);