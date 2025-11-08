require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // Load User model first
const Property = require('../models/Property');

const checkPropertyStatuses = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all unique statuses in the database
    const statuses = await Property.distinct('status');
    console.log('📊 Unique statuses found in database:');
    console.log(statuses);
    console.log('');

    // Count properties by status
    console.log('📈 Property count by status:');
    for (const status of statuses) {
      const count = await Property.countDocuments({ status });
      console.log(`   ${status}: ${count}`);
    }
    console.log('');

    // Get total count
    const totalCount = await Property.countDocuments();
    console.log(`📦 Total properties: ${totalCount}\n`);

    // Check for properties with 'active' status (should be 'available')
    const activeCount = await Property.countDocuments({ status: 'active' });
    if (activeCount > 0) {
      console.log(`⚠️  Found ${activeCount} properties with 'active' status`);
      console.log('   Recommendation: Change to "available" status\n');
    }

    // Get sample properties for each status
    console.log('📝 Sample properties by status:');
    for (const status of statuses) {
      const sample = await Property.findOne({ status })
        .select('title status createdAt')
        .lean();
      if (sample) {
        console.log(`   [${status}] ${sample.title} (Created: ${new Date(sample.createdAt).toLocaleDateString()})`);
      }
    }
    console.log('');

    // Check for properties that might be wrongly marked as sold/rented without assignedTo
    const soldRentedWithoutAssignment = await Property.countDocuments({
      status: { $in: ['sold', 'rented', 'leased'] },
      assignedTo: { $exists: false }
    });
    
    if (soldRentedWithoutAssignment > 0) {
      console.log(`⚠️  Found ${soldRentedWithoutAssignment} sold/rented properties without assignedTo field`);
      console.log('   These might need to be verified\n');
    }

    // Show properties pending approval
    const pendingProperties = await Property.find({ status: 'pending' })
      .select('title owner createdAt')
      .populate('owner', 'email profile.firstName profile.lastName')
      .limit(10)
      .lean();

    if (pendingProperties.length > 0) {
      console.log(`🕐 Properties pending approval (showing first 10):`);
      pendingProperties.forEach(prop => {
        const ownerName = prop.owner ? 
          `${prop.owner.profile?.firstName || ''} ${prop.owner.profile?.lastName || ''}`.trim() || prop.owner.email :
          'Unknown';
        console.log(`   - ${prop.title} by ${ownerName} (Created: ${new Date(prop.createdAt).toLocaleDateString()})`);
      });
    } else {
      console.log('✅ No properties pending approval');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkPropertyStatuses();
