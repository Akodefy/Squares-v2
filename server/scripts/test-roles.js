const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

const testRoles = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Check existing roles
    const existingRoles = await Role.find({});
    console.log(`📊 Found ${existingRoles.length} existing roles:`);
    existingRoles.forEach(role => {
      console.log(`  - ${role.name} (${role.permissions.length} permissions, level: ${role.level})`);
    });

    // Create default roles if none exist
    if (existingRoles.length === 0) {
      console.log('🔄 Creating default roles...');
      
      const defaultRoles = Role.getDefaultRoles();
      for (const roleData of defaultRoles) {
        const role = await Role.create(roleData);
        console.log(`✅ Created role: ${role.name}`);
      }
      
      console.log('✅ Default roles created successfully');
    }

    // Test role permissions
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      console.log(`\n🔑 Admin role permissions (${adminRole.permissions.length}):`);
      adminRole.permissions.forEach(perm => console.log(`  - ${perm}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Check if script is being run directly
if (require.main === module) {
  testRoles();
}

module.exports = testRoles;