const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['privacy-policy', 'refund-policy'],
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Policy', policySchema);
