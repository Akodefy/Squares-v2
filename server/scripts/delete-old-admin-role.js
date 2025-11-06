require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');

const deleteOldAdminRole = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check if old admin role exists
    const oldAdminRole = await Role.findOne({ name: 'admin' });
    
    if (!oldAdminRole) {
      console.log('ℹ️  Old admin role not found - already deleted');
      return;
    }

    // Count users with admin role
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    if (adminUsers > 0) {
      console.log(`❌ Cannot delete admin role: ${adminUsers} user(s) still assigned to it`);
      console.log('🔄 Please migrate these users first using migrate-admin-roles.js');
      return;
    }

    console.log('🗑️  Deleting old admin role...');
    await Role.deleteOne({ name: 'admin' });
    console.log('✅ Old admin role deleted successfully!');
    
    console.log('\n📊 Current Roles:');
    const roles = await Role.find({}).sort({ level: -1 });
    roles.forEach(role => {
      console.log(`   - ${role.name} (Level ${role.level})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

deleteOldAdminRole();
