const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'plot', 'land', 'commercial', 'office', 'pg'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'pending'],
    default: 'available'
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent', 'lease'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  area: {
    builtUp: Number,
    carpet: Number,
    plot: Number,
    unit: {
      type: String,
      enum: ['sqft', 'sqm', 'acre'],
      default: 'sqft'
    }
  },
  bedrooms: {
    type: Number,
    default: 0
  },
  bathrooms: {
    type: Number,
    default: 0
  },
  address: {
    street: {
      type: String,
      required: true
    },
    locality: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to vendor if property is listed by an agent/vendor
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  // Approval tracking
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  modifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
propertySchema.index({ 'address.city': 1, type: 1, listingType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ vendor: 1 });
propertySchema.index({ agent: 1 });
propertySchema.index({ featured: 1 });

// Pre-save middleware to set vendor reference
propertySchema.pre('save', async function(next) {
  try {
    // If owner is changed and no vendor is set, check if owner is an agent
    if (this.isModified('owner') && !this.vendor) {
      const User = require('./User');
      const Vendor = require('./Vendor');
      
      const user = await User.findById(this.owner);
      if (user && user.role === 'agent') {
        const vendor = await Vendor.findByUserId(this.owner);
        if (vendor) {
          this.vendor = vendor._id;
          this.agent = this.owner; // Set agent field as well for backward compatibility
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for primary image
propertySchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null);
});

module.exports = mongoose.model('Property', propertySchema);