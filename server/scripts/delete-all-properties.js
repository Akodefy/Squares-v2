const mongoose = require('mongoose');
const Property = require('../models/Property');
require('dotenv').config();

const deleteAllProperties = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get count of properties before deletion
    const propertiesCount = await Property.countDocuments();
    console.log(`📊 Found ${propertiesCount} properties in database`);

    if (propertiesCount === 0) {
      console.log('ℹ️  No properties found to delete');
      process.exit(0);
    }

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete ALL properties from the database!');
    console.log('⚠️  This action cannot be undone!');
    
    // Delete all properties
    const result = await Property.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} properties`);
    console.log('🧹 Database cleanup completed');

  } catch (error) {
    console.error('❌ Error deleting properties:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Check if script is being run directly
if (require.main === module) {
  deleteAllProperties();
}

module.exports = deleteAllProperties;