const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
require('dotenv').config();

async function linkVendorProfiles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const vendors = await Vendor.find({});
    console.log(`Found ${vendors.length} vendors to link`);
    
    let linkedCount = 0;
    
    for (const vendor of vendors) {
      const user = await User.findById(vendor.user);
      if (user && !user.vendorProfile) {
        user.vendorProfile = vendor._id;
        await user.save();
        console.log(`✓ Linked user ${user.email} to vendor profile`);
        linkedCount++;
      } else if (user && user.vendorProfile) {
        console.log(`- User ${user.email} already linked`);
      } else {
        console.log(`✗ User not found for vendor ${vendor._id}`);
      }
    }
    
    console.log(`\nVendor profile linking completed. Linked ${linkedCount} profiles.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

linkVendorProfiles();