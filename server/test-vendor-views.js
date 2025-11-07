// Test script to verify vendor views performance data
const mongoose = require('mongoose');
require('dotenv').config();

const PropertyView = require('./models/PropertyView');
const Property = require('./models/Property');

async function testViewsPerformance() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test data
    const vendorId = process.argv[2];
    if (!vendorId) {
      console.error('Please provide vendorId as argument');
      process.exit(1);
    }

    console.log(`\nTesting views performance for vendor: ${vendorId}`);
    
    // Get vendor properties
    const properties = await Property.find({ owner: vendorId }).select('_id title');
    const propertyIds = properties.map(p => p._id);
    
    console.log(`\nFound ${properties.length} properties for this vendor`);
    
    // Get total views from PropertyView collection
    const totalViews = await PropertyView.countDocuments({
      property: { $in: propertyIds }
    });
    
    console.log(`Total views tracked: ${totalViews}`);
    
    // Get views in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentViews = await PropertyView.countDocuments({
      property: { $in: propertyIds },
      viewedAt: { $gte: sevenDaysAgo }
    });
    
    console.log(`Views in last 7 days: ${recentViews}`);
    
    // Get unique viewers
    const uniqueViewers = await PropertyView.distinct('viewer', {
      property: { $in: propertyIds },
      viewedAt: { $gte: sevenDaysAgo },
      viewer: { $ne: null }
    });
    
    console.log(`Unique viewers in last 7 days: ${uniqueViewers.length}`);
    
    // Aggregate by date
    const viewsByDate = await PropertyView.aggregate([
      {
        $match: {
          property: { $in: propertyIds },
          viewedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" }
          },
          count: { $sum: 1 },
          uniqueViewers: { $addToSet: "$viewer" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    console.log('\nViews by date:');
    viewsByDate.forEach(item => {
      const uniqueCount = item.uniqueViewers.filter(v => v !== null).length;
      console.log(`  ${item._id}: ${item.count} views (${uniqueCount} unique viewers)`);
    });
    
    await mongoose.connection.close();
    console.log('\nTest completed successfully');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testViewsPerformance();
