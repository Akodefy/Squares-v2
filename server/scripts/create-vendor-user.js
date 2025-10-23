const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const { connectDB } = require('../config/database');

async function createVendorUser() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if vendor user already exists
    const existingVendor = await User.findOne({ email: 'kanagaraj@gmail.com' });
    
    if (existingVendor) {
      console.log('Updating existing vendor user...');
      
      // Set plain password - the pre-save hook will hash it
      existingVendor.password = 'vendor123';
      existingVendor.isEmailVerified = true;
      
      await existingVendor.save();
      console.log('Vendor user updated:', existingVendor.email);
      return;
    }

    // Create vendor user
    // Don't hash password manually - let the pre-save hook do it
    const vendorUser = new User({
      email: 'kanagaraj@gmail.com',
      password: 'vendor123', // Plain password
      role: 'agent',
      status: 'active',
      isEmailVerified: true,
      profile: {
        firstName: 'Test',
        lastName: 'Vendor',
        phone: '+91-9876543210',
        address: {
          street: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        vendorInfo: {
          licenseNumber: 'REA-123456',
          gstNumber: '22AAAAA0000A1Z5',
          panNumber: 'ABCDE1234F',
          companyName: 'Test Real Estate',
          experience: 5,
          specializations: ['Residential', 'Commercial'],
          serviceAreas: ['Mumbai', 'Pune'],
          rating: {
            average: 4.5,
            count: 10
          }
        },
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          privacy: {
            showPhone: true,
            showEmail: false
          }
        }
      }
    });

    await vendorUser.save();
    console.log('Vendor user created successfully:', vendorUser.email);
    
  } catch (error) {
    console.error('Error creating vendor user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createVendorUser();
