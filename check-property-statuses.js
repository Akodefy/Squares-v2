const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ninety-nine-acres')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Property schema (minimal version)
const propertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model('Property', propertySchema);

async function checkStatuses() {
  try {
    // Get all unique statuses in the database
    const statuses = await Property.distinct('status');
    console.log('\n=== All Property Statuses in Database ===');
    console.log(statuses);

    // Count properties by each status
    console.log('\n=== Property Count by Status ===');
    for (const status of statuses) {
      const count = await Property.countDocuments({ status });
      console.log(`${status}: ${count}`);
    }

    // Get sample properties with each status
    console.log('\n=== Sample Properties ===');
    for (const status of statuses) {
      const sample = await Property.findOne({ status }).select('title status listingType createdAt');
      console.log(`\nStatus: ${status}`);
      console.log(sample);
    }

    // Total count
    const total = await Property.countDocuments();
    console.log(`\nTotal Properties: ${total}`);

    // Check for null or undefined statuses
    const nullStatus = await Property.countDocuments({ status: { $exists: false } });
    const emptyStatus = await Property.countDocuments({ status: '' });
    const nullOrEmpty = await Property.countDocuments({ $or: [{ status: null }, { status: '' }, { status: { $exists: false } }] });
    
    console.log(`\nProperties with no status: ${nullStatus}`);
    console.log(`Properties with empty status: ${emptyStatus}`);
    console.log(`Properties with null/empty/missing status: ${nullOrEmpty}`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkStatuses();
