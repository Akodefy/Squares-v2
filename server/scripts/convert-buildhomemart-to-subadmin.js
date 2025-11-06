require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const convertToSubAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Find the user
    const user = await User.findOne({ email: 'admin@buildhomemart.com' });
    
    if (!user) {
      console.log('❌ User admin@buildhomemart.com not found');
      return;
    }

    console.log('📋 Current User Details:');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Status:', user.status);
    console.log('  Name:', user.profile?.firstName, user.profile?.lastName);
    console.log('');

    // Update to subadmin
    user.role = 'subadmin';
    await user.save();

    console.log('✅ Successfully converted to SubAdmin!');
    console.log('');
    console.log('📋 Updated User Details:');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Status:', user.status);
    console.log('');

    // Verify the change
    const verifyUser = await User.findOne({ email: 'admin@buildhomemart.com' });
    console.log('🔍 Verification:');
    console.log('  Role in DB:', verifyUser.role);
    console.log('');

    // Show all admin users
    console.log('📊 All Admin Users:');
    const allAdmins = await User.find({ 
      role: { $in: ['superadmin', 'subadmin', 'admin'] } 
    }).select('email role status profile.firstName profile.lastName');

    allAdmins.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.email}`);
      console.log(`     Role: ${admin.role}`);
      console.log(`     Status: ${admin.status}`);
      console.log(`     Name: ${admin.profile?.firstName || 'N/A'} ${admin.profile?.lastName || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

convertToSubAdmin();
