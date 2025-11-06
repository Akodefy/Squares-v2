require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');

const checkAndFixAdminRole = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check all roles in database
    console.log('📋 Current Roles in Database:');
    const allRoles = await Role.find({}).sort({ level: -1 });
    
    for (const role of allRoles) {
      const userCount = await User.countDocuments({ role: role.name });
      console.log(`\n   ${role.name.toUpperCase()}`);
      console.log(`   - ID: ${role._id}`);
      console.log(`   - Description: ${role.description}`);
      console.log(`   - Level: ${role.level}`);
      console.log(`   - Permissions: ${role.permissions.length}`);
      console.log(`   - Users: ${userCount}`);
      console.log(`   - System Role: ${role.isSystemRole ? 'Yes' : 'No'}`);
      console.log(`   - Active: ${role.isActive ? 'Yes' : 'No'}`);
    }

    // Check if old admin role exists
    const oldAdminRole = await Role.findOne({ name: 'admin' });
    
    if (oldAdminRole) {
      console.log('\n⚠️  Old "admin" role found in database!');
      
      // Check if any users still have admin role
      const adminUsers = await User.countDocuments({ role: 'admin' });
      
      if (adminUsers === 0) {
        console.log('✅ No users are assigned to the old "admin" role');
        console.log('🗑️  Deleting old "admin" role...');
        
        await Role.deleteOne({ name: 'admin' });
        console.log('✅ Old "admin" role deleted successfully!');
      } else {
        console.log(`⚠️  ${adminUsers} user(s) still have "admin" role`);
        console.log('🔄 Migrating these users to "superadmin"...');
        
        await User.updateMany(
          { role: 'admin' },
          { $set: { role: 'superadmin' } }
        );
        
        console.log(`✅ Migrated ${adminUsers} user(s) to superadmin`);
        console.log('🗑️  Now deleting old "admin" role...');
        
        await Role.deleteOne({ name: 'admin' });
        console.log('✅ Old "admin" role deleted successfully!');
      }
    } else {
      console.log('\n✅ No old "admin" role found - database is clean!');
    }

    // Verify final state
    console.log('\n📊 Final Roles Summary:');
    const finalRoles = await Role.find({}).sort({ level: -1 });
    
    for (const role of finalRoles) {
      const userCount = await User.countDocuments({ role: role.name });
      console.log(`\n   ${role.name.toUpperCase()}`);
      console.log(`   - Level: ${role.level}`);
      console.log(`   - Users: ${userCount}`);
      console.log(`   - Active: ${role.isActive ? 'Yes' : 'No'}`);
    }

    console.log('\n🎉 Database cleanup completed!');
    console.log('\n💡 Please refresh your browser to see the correct roles.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

// Run the script
checkAndFixAdminRole();
