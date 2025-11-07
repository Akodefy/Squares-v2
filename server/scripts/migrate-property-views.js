const mongoose = require('mongoose');
require('dotenv').config();

const Property = require('../models/Property');
const PropertyView = require('../models/PropertyView');

async function migratePropertyViews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all properties with views > 0
    const properties = await Property.find({ views: { $gt: 0 } }).select('_id views owner createdAt');
    
    console.log(`\nFound ${properties.length} properties with existing view counts`);

    let totalViewsCreated = 0;
    
    for (const property of properties) {
      const viewCount = property.views || 0;
      
      if (viewCount === 0) continue;

      // Check if PropertyView records already exist for this property
      const existingViewCount = await PropertyView.countDocuments({ property: property._id });
      
      if (existingViewCount > 0) {
        console.log(`Property ${property._id} already has ${existingViewCount} view records, skipping...`);
        continue;
      }

      // Create historical view records distributed over the property's lifetime
      const propertyAge = Date.now() - new Date(property.createdAt).getTime();
      const daysSinceCreation = Math.max(1, Math.floor(propertyAge / (1000 * 60 * 60 * 24)));
      
      const viewRecords = [];
      
      for (let i = 0; i < viewCount; i++) {
        // Distribute views randomly over the property's lifetime
        const randomDaysAgo = Math.floor(Math.random() * daysSinceCreation);
        const viewedAt = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
        
        viewRecords.push({
          property: property._id,
          viewer: null, // Anonymous historical views
          viewedAt: viewedAt,
          ipAddress: 'migrated-data',
          userAgent: 'Historical Data Migration',
          sessionId: `migration-${property._id}-${i}`,
          interactions: {
            clickedPhone: false,
            clickedEmail: false,
            clickedWhatsApp: false,
            viewedGallery: false,
          },
          createdAt: viewedAt,
          updatedAt: viewedAt
        });
      }

      // Insert in batches to avoid memory issues
      if (viewRecords.length > 0) {
        await PropertyView.insertMany(viewRecords);
        totalViewsCreated += viewRecords.length;
        console.log(`Migrated ${viewRecords.length} views for property: ${property._id}`);
      }
    }

    console.log(`\n✓ Migration completed successfully!`);
    console.log(`Total PropertyView records created: ${totalViewsCreated}`);

    // Verify the migration
    console.log('\nVerifying migration...');
    const totalPropertyViews = await PropertyView.countDocuments({});
    console.log(`Total PropertyView records in database: ${totalPropertyViews}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

migratePropertyViews();
