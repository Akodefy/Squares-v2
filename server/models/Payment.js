const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  paymentGateway: {
    type: String,
    default: 'razorpay',
    enum: ['razorpay', 'stripe', 'paypal']
  },
  type: {
    type: String,
    enum: ['subscription_purchase', 'addon_purchase', 'renewal', 'upgrade'],
    required: true
  },
  description: {
    type: String
  },
  metadata: {
    planId: String,
    planName: String,
    billingCycle: String,
    addons: [String]
  },
  failureReason: {
    type: String
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date
  },
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Index for cleanup queries
paymentSchema.index({ status: 1, expiresAt: 1 });
paymentSchema.index({ createdAt: 1 });

// Virtual to check if payment is expired
paymentSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return this.status === 'pending' && new Date() > this.expiresAt;
});

// Method to mark payment as cancelled
paymentSchema.methods.markAsCancelled = function(reason) {
  this.status = 'cancelled';
  this.failureReason = reason || 'Payment timeout - exceeded Razorpay limit';
  this.updatedAt = new Date();
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.updatedAt = new Date();
  return this.save();
};

// Static method to find expired payments
paymentSchema.statics.findExpired = function() {
  const now = new Date();
  return this.find({
    status: 'pending',
    $or: [
      { expiresAt: { $lt: now } },
      { 
        expiresAt: { $exists: false },
        createdAt: { $lt: new Date(now - 15 * 60 * 1000) } // 15 minutes
      }
    ]
  });
};

// Static method to get payment by identifier (ID, order ID, or payment ID)
paymentSchema.statics.findByIdentifier = function(identifier) {
  return this.findOne({
    $or: [
      { _id: identifier },
      { razorpayOrderId: identifier },
      { razorpayPaymentId: identifier }
    ]
  });
};

paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
