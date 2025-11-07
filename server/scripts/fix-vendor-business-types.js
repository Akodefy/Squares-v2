const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ninety-nine-acres';

async function fixVendorBusinessTypes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Vendor = mongoose.model('Vendor', require('../models/Vendor').schema);

    // Find all vendors with invalid businessType
    const invalidVendors = await Vendor.find({
      'businessInfo.businessType': { $nin: [
        'real_estate_agent',
        'property_developer',
        'construction_company',
        'interior_designer',
        'legal_services',
        'home_loan_provider',
        'packers_movers',
        'property_management',
        'other'
      ]}
    });

    console.log(`Found ${invalidVendors.length} vendors with invalid businessType`);

    // Update vendors with 'individual' to 'real_estate_agent'
    const result = await Vendor.updateMany(
      {
        $or: [
          { 'businessInfo.businessType': 'individual' },
          { 'businessInfo.businessType': { $exists: false } },
          { 'businessInfo.businessType': null },
          { 'businessInfo.businessType': '' }
        ]
      },
      {
        $set: { 'businessInfo.businessType': 'real_estate_agent' }
      }
    );

    console.log(`Updated ${result.modifiedCount} vendors`);
    console.log('Migration completed successfully');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixVendorBusinessTypes();
