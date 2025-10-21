const mongoose = require('mongoose');
const Property = require('./models/Property');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    // Get the current user as owner
    const user = await User.findOne({ email: 'ddd732443@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    // Sample properties data
    const sampleProperties = [
      {
        title: 'Luxury Villa in Whitefield',
        description: 'Beautiful 4BHK villa with modern amenities, swimming pool, and garden.',
        type: 'villa',
        listingType: 'sale',
        price: 12500000,
        area: { builtUp: 3500, unit: 'sqft' },
        bedrooms: 4,
        bathrooms: 3,
        address: {
          street: '123 Main Street',
          locality: 'Whitefield',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560066'
        },
        amenities: ['Swimming Pool', 'Garden', 'Parking', 'Security'],
        images: [
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be', isPrimary: false }
        ],
        owner: user._id,
        featured: true
      },
      {
        title: 'Modern Apartment in Koramangala',
        description: 'Spacious 3BHK apartment in prime location with all modern facilities.',
        type: 'apartment',
        listingType: 'rent',
        price: 45000,
        area: { builtUp: 1800, unit: 'sqft' },
        bedrooms: 3,
        bathrooms: 2,
        address: {
          street: '456 Park Avenue',
          locality: 'Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034'
        },
        amenities: ['Gym', 'Elevator', 'Parking', 'Power Backup'],
        images: [
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', isPrimary: false }
        ],
        owner: user._id,
        featured: false
      },
      {
        title: 'Commercial Plot in Electronic City',
        description: 'Prime commercial plot suitable for office complex or shopping mall.',
        type: 'plot',
        listingType: 'sale',
        price: 25000000,
        area: { plot: 8000, unit: 'sqft' },
        bedrooms: 0,
        bathrooms: 0,
        address: {
          street: 'Electronic City Phase 1',
          locality: 'Electronic City',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560100'
        },
        amenities: ['Road Access', 'Electricity', 'Water Connection'],
        images: [
          { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c', isPrimary: true }
        ],
        owner: user._id,
        featured: true
      }
    ];

    // Delete existing properties
    await Property.deleteMany({});
    
    // Insert sample properties
    await Property.insertMany(sampleProperties);
    
    console.log('Sample properties added successfully!');
    console.log('Added', sampleProperties.length, 'properties');
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
});