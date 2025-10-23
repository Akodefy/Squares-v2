require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkVendorUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check both vendor emails
    const vendorEmails = ['vendor1@ninetyneacres.com', 'kanagaraj@gmail.com'];
    
    for (const email of vendorEmails) {
      console.log(`🔍 Checking user: ${email}`);
      const user = await User.findOne({ email: email });
      
      if (user) {
        console.log('✅ User Found:');
        console.log('   ID:', user._id);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Status:', user.status);
        console.log('   Name:', `${user.profile.firstName} ${user.profile.lastName}`);
        console.log('   Email Verified:', user.profile.emailVerified);
        console.log('   Created:', user.createdAt);
        console.log('   Password Hash Length:', user.password ? user.password.length : 'No password');
        console.log('   Profile Data:', JSON.stringify(user.profile, null, 2));
      } else {
        console.log('❌ User not found');
      }
      console.log('-------------------------------------------\n');
    }

    // Also check all agent users
    console.log('📋 All Agent Users:');
    const allAgents = await User.find({ role: 'agent' });
    for (const agent of allAgents) {
      console.log(`   - ${agent.email} (${agent.status}) - ${agent.profile.firstName} ${agent.profile.lastName}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n📡 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

checkVendorUsers();
