require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');

const migrateAdminRoles = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check if superadmin and subadmin roles already exist
    const existingSuperAdmin = await Role.findOne({ name: 'superadmin' });
    const existingSubAdmin = await Role.findOne({ name: 'subadmin' });
    
    // Create SuperAdmin role if it doesn't exist
    if (!existingSuperAdmin) {
      console.log('📝 Creating SuperAdmin role...');
      const superAdminRole = await Role.create({
        name: 'superadmin',
        description: 'Super Administrator with full system access and control',
        permissions: [
          'create_property', 'read_property', 'update_property', 'delete_property',
          'manage_users', 'manage_roles', 'manage_plans', 'view_dashboard',
          'manage_settings', 'manage_content', 'send_messages', 'moderate_content',
          'access_analytics', 'review_properties', 'approve_properties', 'reject_properties',
          'moderate_user_content', 'handle_support_tickets', 'track_vendor_performance',
          'approve_promotions', 'send_notifications', 'generate_reports',
          'approve_vendors', 'reject_vendors', 'review_vendors'
        ],
        isSystemRole: true,
        isActive: true,
        level: 10
      });
      console.log('✅ SuperAdmin role created successfully');
      console.log(`   - Permissions: ${superAdminRole.permissions.length}`);
      console.log(`   - Level: ${superAdminRole.level}`);
    } else {
      console.log('⚠️  SuperAdmin role already exists');
    }

    // Create SubAdmin role if it doesn't exist
    if (!existingSubAdmin) {
      console.log('\n📝 Creating SubAdmin role...');
      const subAdminRole = await Role.create({
        name: 'subadmin',
        description: 'Sub Administrator with limited administrative access',
        permissions: [
          'read_property', 'update_property',
          'review_properties', 'approve_properties', 'reject_properties',
          'moderate_user_content', 'handle_support_tickets',
          'track_vendor_performance', 'approve_promotions',
          'send_notifications', 'generate_reports',
          'approve_vendors', 'reject_vendors', 'review_vendors',
          'view_dashboard', 'send_messages', 'moderate_content', 'access_analytics'
        ],
        isSystemRole: true,
        isActive: true,
        level: 7
      });
      console.log('✅ SubAdmin role created successfully');
      console.log(`   - Permissions: ${subAdminRole.permissions.length}`);
      console.log(`   - Level: ${subAdminRole.level}`);
    } else {
      console.log('⚠️  SubAdmin role already exists');
    }

    // Migrate existing admin users to superadmin
    console.log('\n🔄 Checking for existing admin users...');
    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length > 0) {
      console.log(`📊 Found ${adminUsers.length} admin user(s)`);
      console.log('🔄 Migrating admin users to superadmin role...');
      
      for (const user of adminUsers) {
        user.role = 'superadmin';
        await user.save();
        console.log(`   ✅ Migrated: ${user.email} → superadmin`);
      }
      
      console.log(`✅ Successfully migrated ${adminUsers.length} admin user(s) to superadmin`);
    } else {
      console.log('ℹ️  No admin users found to migrate');
    }

    // Check if old admin role exists and can be removed
    const oldAdminRole = await Role.findOne({ name: 'admin' });
    if (oldAdminRole) {
      console.log('\n📋 Old admin role found');
      console.log('ℹ️  You can manually delete it if no users are assigned to it');
      console.log(`   Role ID: ${oldAdminRole._id}`);
      
      // Count users with admin role (should be 0 after migration)
      const remainingAdmins = await User.countDocuments({ role: 'admin' });
      if (remainingAdmins === 0) {
        console.log('🗑️  No users assigned to admin role, it can be safely deleted');
        // Optionally delete it
        // await Role.deleteOne({ name: 'admin' });
        // console.log('✅ Old admin role deleted');
      } else {
        console.log(`⚠️  ${remainingAdmins} user(s) still have admin role`);
      }
    }

    // Display summary
    console.log('\n📊 Final Role Summary:');
    const allRoles = await Role.find({}).sort({ level: -1 });
    for (const role of allRoles) {
      const userCount = await User.countDocuments({ role: role.name });
      console.log(`\n   ${role.name.toUpperCase()}`);
      console.log(`   - Description: ${role.description}`);
      console.log(`   - Level: ${role.level}`);
      console.log(`   - Permissions: ${role.permissions.length}`);
      console.log(`   - Users: ${userCount}`);
      console.log(`   - System Role: ${role.isSystemRole ? 'Yes' : 'No'}`);
      console.log(`   - Active: ${role.isActive ? 'Yes' : 'No'}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh your browser to see the updated roles');
    console.log('   2. Super Admin users now have full system access');
    console.log('   3. You can create Sub Admin users for limited admin access');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

// Run the migration
migrateAdminRoles();
