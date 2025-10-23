const mongoose = require('mongoose');

const addonServiceSchema = new mongoose.Schema({
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
  billingType: {
    type: String,
    required: true,
    enum: ['per_property', 'monthly', 'yearly', 'one_time']
  },
  category: {
    type: String,
    required: true,
    enum: ['photography', 'marketing', 'technology', 'support', 'crm']
  },
  icon: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AddonService', addonServiceSchema);
