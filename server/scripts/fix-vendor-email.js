require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const fixVendorEmailVerification = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Fix the specific user
    const email = 'kanagaraj@gmail.com';
    
    console.log(`🔧 Fixing email verification for: ${email}`);
    
    const user = await User.findOne({ email: email });
    
    if (user) {
      console.log('📋 Current user status:');
      console.log('   Status:', user.status);
      console.log('   Email Verified:', user.profile.emailVerified);
      
      // Update email verification
      user.profile.emailVerified = true;
      await user.save();
      
      console.log('✅ Updated successfully!');
      console.log('   New Email Verified:', user.profile.emailVerified);
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n📡 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

fixVendorEmailVerification();
