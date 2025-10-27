const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
require('dotenv').config();

async function checkVendorData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check Users with agent role
    const agentUsers = await User.find({ role: 'agent' });
    console.log('\n=== AGENT USERS ===');
    console.log('Total agent users:', agentUsers.length);
    
    agentUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   VendorProfile: ${user.vendorProfile || 'Not linked'}`);
      console.log('');
    });
    
    // Check Vendor table
    const vendors = await Vendor.find({}).populate('user', 'email role status');
    console.log('=== VENDOR RECORDS ===');
    console.log('Total vendor records:', vendors.length);
    
    vendors.forEach((vendor, index) => {
      console.log(`${index + 1}. Company: ${vendor.businessInfo.companyName}`);
      console.log(`   User Email: ${vendor.user.email}`);
      console.log(`   User ID: ${vendor.user._id}`);
      console.log(`   Status: ${vendor.status}`);
      console.log(`   Verified: ${vendor.verification.isVerified}`);
      console.log('');
    });
    
    // Check if user-vendor links are correct
    console.log('=== LINKING VERIFICATION ===');
    let allLinked = true;
    for (const user of agentUsers) {
      const vendor = await Vendor.findOne({ user: user._id });
      const hasLink = user.vendorProfile && vendor && user.vendorProfile.toString() === vendor._id.toString();
      console.log(`User ${user.email}: ${hasLink ? '✅ Properly linked' : '❌ Link missing/broken'}`);
      if (!hasLink) allLinked = false;
    }
    
    console.log(`\nAll users properly linked: ${allLinked ? '✅ Yes' : '❌ No'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVendorData();