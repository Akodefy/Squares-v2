require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Property = require('../models/Property');
const ServiceBooking = require('../models/ServiceBooking');
const VendorService = require('../models/VendorService');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createSampleEarnings() {
  try {
    console.log('Creating sample earnings data for vendors...');

    // Get vendor users
    const vendorUsers = await User.find({ role: 'agent' }).limit(3);
    console.log(`Found ${vendorUsers.length} vendor users`);

    if (vendorUsers.length === 0) {
      console.log('No vendor users found');
      return;
    }

    // Create sample sold properties for earnings
    const sampleProperties = [];
    for (let i = 0; i < vendorUsers.length; i++) {
      const vendor = vendorUsers[i];
      
      // Create 3-5 properties per vendor, some sold
      for (let j = 0; j < 4; j++) {
        const propertyData = {
          title: `Premium ${j % 2 === 0 ? 'Apartment' : 'Villa'} in ${j % 3 === 0 ? 'Bangalore' : j % 3 === 1 ? 'Mumbai' : 'Delhi'}`,
          description: `Beautiful ${j % 2 === 0 ? '3BHK apartment' : 'luxury villa'} with modern amenities`,
          type: j % 2 === 0 ? 'apartment' : 'villa',
          status: j < 2 ? 'sold' : 'available', // First 2 properties are sold
          listingType: 'sale',
          price: (j % 2 === 0 ? 5000000 : 12000000) + (Math.random() * 2000000), // 50L-70L for apartments, 1.2-1.4Cr for villas
          area: {
            builtUp: j % 2 === 0 ? 1200 : 2500,
            carpet: j % 2 === 0 ? 1000 : 2200,
            unit: 'sqft'
          },
          bedrooms: j % 2 === 0 ? 3 : 4,
          bathrooms: j % 2 === 0 ? 2 : 4,
          address: {
            street: `${j + 1} Street, Sector ${10 + j}`,
            locality: j % 3 === 0 ? 'Koramangala' : j % 3 === 1 ? 'Bandra' : 'CP',
            city: j % 3 === 0 ? 'Bangalore' : j % 3 === 1 ? 'Mumbai' : 'Delhi',
            state: j % 3 === 0 ? 'Karnataka' : j % 3 === 1 ? 'Maharashtra' : 'Delhi',
            pincode: j % 3 === 0 ? '560034' : j % 3 === 1 ? '400050' : '110001'
          },
          amenities: ['Parking', 'Security', 'Gym', 'Swimming Pool'],
          owner: vendor._id,
          agent: vendor._id,
          views: Math.floor(Math.random() * 500) + 100,
          featured: j === 0,
          verified: true
        };

        sampleProperties.push(propertyData);
      }
    }

    // Clear existing sample properties and create new ones
    await Property.deleteMany({ 
      title: { $regex: /Premium (Apartment|Villa)/ }
    });
    
    const createdProperties = await Property.insertMany(sampleProperties);
    console.log(`✓ Created ${createdProperties.length} sample properties`);

    // Create sample vendor services and bookings
    const sampleServices = [];
    const sampleBookings = [];

    for (let i = 0; i < vendorUsers.length; i++) {
      const vendor = vendorUsers[i];
      
      // Create services for each vendor
      const services = [
        {
          vendorId: vendor._id,
          title: 'Property Valuation Service',
          description: 'Professional property valuation and market analysis',
          category: 'consultation',
          subCategory: 'valuation',
          pricing: {
            type: 'fixed',
            amount: 2500,
            currency: 'INR'
          },
          location: {
            city: i % 3 === 0 ? 'Bangalore' : i % 3 === 1 ? 'Mumbai' : 'Delhi',
            state: i % 3 === 0 ? 'Karnataka' : i % 3 === 1 ? 'Maharashtra' : 'Delhi'
          },
          availability: {
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            hours: { start: '09:00', end: '18:00' }
          },
          isActive: true
        },
        {
          vendorId: vendor._id,
          title: 'Home Inspection Service',
          description: 'Comprehensive home inspection before purchase',
          category: 'inspection',
          subCategory: 'home_inspection',
          pricing: {
            type: 'fixed',
            amount: 5000,
            currency: 'INR'
          },
          location: {
            city: i % 3 === 0 ? 'Bangalore' : i % 3 === 1 ? 'Mumbai' : 'Delhi',
            state: i % 3 === 0 ? 'Karnataka' : i % 3 === 1 ? 'Maharashtra' : 'Delhi'
          },
          availability: {
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            hours: { start: '10:00', end: '17:00' }
          },
          isActive: true
        }
      ];

      sampleServices.push(...services);
    }

    // Clear existing sample services and create new ones
    await VendorService.deleteMany({ 
      title: { $regex: /(Property Valuation|Home Inspection) Service/ }
    });
    
    const createdServices = await VendorService.insertMany(sampleServices);
    console.log(`✓ Created ${createdServices.length} sample services`);

    // Create sample bookings with earnings
    for (let i = 0; i < createdServices.length; i++) {
      const service = createdServices[i];
      
      // Create 2-4 bookings per service
      const bookingCount = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < bookingCount; j++) {
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 45)); // Random date within last 45 days
        
        const serviceDate = new Date(bookingDate);
        serviceDate.setDate(serviceDate.getDate() + Math.floor(Math.random() * 7) + 1); // Service 1-7 days after booking

        const booking = {
          serviceId: service._id,
          vendorId: service.vendorId,
          clientId: vendorUsers[(i + j + 1) % vendorUsers.length]._id, // Different client
          bookingDate: bookingDate,
          serviceDate: serviceDate,
          duration: service.title.includes('Valuation') ? 2 : 4, // 2 hours for valuation, 4 for inspection
          amount: service.pricing.amount,
          currency: 'INR',
          status: j < bookingCount - 1 ? 'completed' : Math.random() > 0.5 ? 'completed' : 'confirmed',
          paymentStatus: j < bookingCount - 1 ? 'paid' : Math.random() > 0.3 ? 'paid' : 'pending',
          paymentId: `pay_${Date.now()}_${i}_${j}`,
          notes: 'Service completed successfully',
          address: {
            street: `${j + 1} Service Street`,
            city: service.location.city,
            state: service.location.state,
            pincode: service.location.city === 'Bangalore' ? '560001' : service.location.city === 'Mumbai' ? '400001' : '110001'
          },
          contactInfo: {
            phone: `+91${9000000000 + (i * 100) + j}`,
            email: `client${i}${j}@example.com`,
            preferredContactMethod: 'phone'
          },
          rating: j < bookingCount - 1 ? Math.floor(Math.random() * 2) + 4 : null, // 4 or 5 star rating for completed
          review: j < bookingCount - 1 ? 'Great service, very professional!' : null
        };

        sampleBookings.push(booking);
      }
    }

    // Clear existing sample bookings and create new ones
    await ServiceBooking.deleteMany({ 
      paymentId: { $regex: /^pay_\d+_\d+_\d+$/ }
    });
    
    const createdBookings = await ServiceBooking.insertMany(sampleBookings);
    console.log(`✓ Created ${createdBookings.length} sample service bookings`);

    // Calculate and display total earnings
    const totalServiceEarnings = createdBookings
      .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);

    const soldPropertiesValue = createdProperties
      .filter(p => p.status === 'sold')
      .reduce((sum, p) => sum + (p.price * 0.02), 0); // 2% commission

    console.log('\n=== EARNINGS SUMMARY ===');
    console.log(`Total Service Earnings: ₹${totalServiceEarnings.toLocaleString('en-IN')}`);
    console.log(`Total Property Commission: ₹${Math.round(soldPropertiesValue).toLocaleString('en-IN')}`);
    console.log(`Total Business Revenue: ₹${Math.round(totalServiceEarnings + soldPropertiesValue).toLocaleString('en-IN')}`);
    console.log(`Completed Service Bookings: ${createdBookings.filter(b => b.status === 'completed').length}`);
    console.log(`Sold Properties: ${createdProperties.filter(p => p.status === 'sold').length}`);

    console.log('\nSample earnings data created successfully!');

  } catch (error) {
    console.error('Error creating sample earnings:', error);
  }
}

async function main() {
  await connectDB();
  await createSampleEarnings();
  await mongoose.disconnect();
  console.log('Database connection closed');
}

main().catch(console.error);