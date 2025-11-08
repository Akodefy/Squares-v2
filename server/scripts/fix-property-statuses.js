require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // Load User model first
const Property = require('../models/Property');

const fixPropertyStatuses = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let fixedCount = 0;

    // Fix 1: Change 'active' to 'available'
    const activeProperties = await Property.updateMany(
      { status: 'active' },
      { $set: { status: 'available' } }
    );
    
    if (activeProperties.modifiedCount > 0) {
      console.log(`✅ Fixed ${activeProperties.modifiedCount} properties: 'active' → 'available'`);
      fixedCount += activeProperties.modifiedCount;
    }

    // Fix 2: Ensure sold/rented/leased properties have proper approval status
    const soldRentedProperties = await Property.find({
      status: { $in: ['sold', 'rented', 'leased'] },
      verified: false
    });

    if (soldRentedProperties.length > 0) {
      for (const prop of soldRentedProperties) {
        prop.verified = true;
        if (!prop.approvedAt) {
          prop.approvedAt = prop.updatedAt || prop.createdAt;
        }
        await prop.save();
      }
      console.log(`✅ Verified ${soldRentedProperties.length} sold/rented/leased properties`);
      fixedCount += soldRentedProperties.length;
    }

    // Fix 3: Check for properties with invalid statuses
    const validStatuses = ['available', 'sold', 'rented', 'leased', 'pending', 'rejected'];
    const invalidProperties = await Property.find({
      status: { $nin: validStatuses }
    });

    if (invalidProperties.length > 0) {
      console.log(`\n⚠️  Found ${invalidProperties.length} properties with invalid statuses:`);
      for (const prop of invalidProperties) {
        console.log(`   - ${prop.title}: status = "${prop.status}"`);
      }
      console.log('   Please manually review these properties\n');
    }

    // Show summary
    console.log('\n📊 Current status distribution:');
    const statuses = await Property.distinct('status');
    for (const status of statuses) {
      const count = await Property.countDocuments({ status });
      console.log(`   ${status}: ${count}`);
    }

    const totalProperties = await Property.countDocuments();
    console.log(`\n📦 Total properties: ${totalProperties}`);
    console.log(`🔧 Total fixes applied: ${fixedCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

fixPropertyStatuses();
