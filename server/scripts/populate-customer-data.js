require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const populateCustomerData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 URI: ${process.env.MONGODB_URI?.substring(0, 40)}...`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check existing customers
    const existingCustomers = await User.find({ role: 'customer' });
    console.log(`📊 Found ${existingCustomers.length} existing customers\n`);

    if (existingCustomers.length > 0) {
      console.log('📋 Existing Customers:');
      existingCustomers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.profile?.firstName} ${customer.profile?.lastName} (${customer.email}) - Status: ${customer.status}`);
      });
      console.log('\n');
    }

    // Sample customer data to populate
    const sampleCustomers = [
      {
        email: 'customer1@example.com',
        password: 'Customer@123',
        profile: {
          firstName: 'Rajesh',
          lastName: 'Kumar',
          phone: '9876543210',
          emailVerified: true,
          preferences: {
            notifications: {
              email: true,
              sms: true,
              push: true
            }
          }
        },
        role: 'customer',
        status: 'active'
      },
      {
        email: 'customer2@example.com',
        password: 'Customer@123',
        profile: {
          firstName: 'Priya',
          lastName: 'Sharma',
          phone: '9876543211',
          emailVerified: true,
          preferences: {
            notifications: {
              email: true,
              sms: false,
              push: true
            }
          }
        },
        role: 'customer',
        status: 'active'
      },
      {
        email: 'customer3@example.com',
        password: 'Customer@123',
        profile: {
          firstName: 'Amit',
          lastName: 'Patel',
          phone: '9876543212',
          emailVerified: true,
          preferences: {
            notifications: {
              email: true,
              sms: true,
              push: false
            }
          }
        },
        role: 'customer',
        status: 'active'
      },
      {
        email: 'customer4@example.com',
        password: 'Customer@123',
        profile: {
          firstName: 'Sneha',
          lastName: 'Reddy',
          phone: '9876543213',
          emailVerified: true,
          preferences: {
            notifications: {
              email: true,
              sms: true,
              push: true
            }
          }
        },
        role: 'customer',
        status: 'active'
      },
      {
        email: 'customer5@example.com',
        password: 'Customer@123',
        profile: {
          firstName: 'Vikram',
          lastName: 'Singh',
          phone: '9876543214',
          emailVerified: true,
          preferences: {
            notifications: {
              email: false,
              sms: true,
              push: true
            }
          }
        },
        role: 'customer',
        status: 'active'
      }
    ];

    console.log('🔄 Creating sample customers...\n');
    let createdCount = 0;
    let skippedCount = 0;

    for (const customerData of sampleCustomers) {
      try {
        // Check if customer already exists
        const existingCustomer = await User.findOne({ email: customerData.email });
        
        if (existingCustomer) {
          console.log(`⏭️  Skipped: ${customerData.email} (already exists)`);
          skippedCount++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(customerData.password, 12);

        // Create customer
        const customer = await User.create({
          email: customerData.email,
          password: hashedPassword,
          profile: customerData.profile,
          role: customerData.role,
          status: customerData.status
        });

        console.log(`✅ Created: ${customer.profile.firstName} ${customer.profile.lastName} (${customer.email})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${customerData.email}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${createdCount} customers`);
    console.log(`   ⏭️  Skipped: ${skippedCount} customers (already exist)`);
    console.log(`   📋 Total in DB: ${await User.countDocuments({ role: 'customer' })} customers`);
    console.log('='.repeat(60));

    // Display all customers after population
    console.log('\n📋 All Customers in Database:');
    const allCustomers = await User.find({ role: 'customer' })
      .select('email profile.firstName profile.lastName profile.phone status createdAt')
      .sort({ createdAt: -1 });

    allCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.profile?.firstName} ${customer.profile?.lastName}`);
      console.log(`   📧 Email: ${customer.email}`);
      console.log(`   📱 Phone: ${customer.profile?.phone || 'N/A'}`);
      console.log(`   ⭐ Status: ${customer.status}`);
      console.log(`   📅 Created: ${customer.createdAt.toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
populateCustomerData();
