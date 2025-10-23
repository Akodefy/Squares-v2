const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const { connectDB } = require('../config/database');

async function checkVendorUser() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const vendor = await User.findOne({ email: 'vendor@ninetyneacres.com' });
    
    if (vendor) {
      console.log('Vendor found:', {
        id: vendor._id,
        email: vendor.email,
        role: vendor.role,
        status: vendor.status,
        isEmailVerified: vendor.isEmailVerified
      });

      // Test password
      const isValidPassword = await bcrypt.compare('vendor123', vendor.password);
      console.log('Password test result:', isValidPassword);
    } else {
      console.log('Vendor user not found');
    }

  } catch (error) {
    console.error('Check error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkVendorUser();
