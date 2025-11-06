const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Role = require('../models/Role');

const convertToSubAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const targetEmail = 'admin@buildhomemart.com';
    
    // Find the user
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.log(`❌ User not found: ${targetEmail}`);
      process.exit(1);
    }

    console.log(`\n📧 Found user: ${user.email}`);
    console.log(`   Current role: ${user.role}`);
    console.log(`   Status: ${user.status}`);

    // Find SubAdmin role
    const subAdminRole = await Role.findOne({ name: { $regex: /^subadmin$/i } });
    if (!subAdminRole) {
      console.log('❌ SubAdmin role not found in database');
      process.exit(1);
    }

    console.log(`\n✓ Found SubAdmin role: ${subAdminRole.name}`);

    // Update user to SubAdmin
    user.role = 'subadmin';
    await user.save();

    console.log(`\n✅ Successfully converted ${targetEmail} to SubAdmin`);
    console.log(`   New role: ${user.role}`);

    // Verify the change
    const updatedUser = await User.findOne({ email: targetEmail });
    console.log(`\n✓ Verification:`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Status: ${updatedUser.status}`);

    // Count users by role
    const superAdminCount = await User.countDocuments({ role: 'superadmin' });
    const subAdminCount = await User.countDocuments({ role: 'subadmin' });

    console.log(`\n📊 Admin Summary:`);
    console.log(`   SuperAdmin users: ${superAdminCount}`);
    console.log(`   SubAdmin users: ${subAdminCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

convertToSubAdmin();
