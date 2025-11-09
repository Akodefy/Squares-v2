require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./server/models/User');

const testDheenaLogin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    const email = 'dheena@gmail.com';
    const password = 'Dheena@123';

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('\n📋 Checking all users in database...');
      const allUsers = await User.find({}).select('email role status createdAt');
      console.log(`Found ${allUsers.length} users:`);
      allUsers.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.email} - ${u.role} - ${u.status}`);
      });
      return;
    }

    console.log('✅ User found in database:');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Status:', user.status);
    console.log('   Email Verified:', user.isEmailVerified);
    console.log('   Created:', user.createdAt);
    console.log('   Name:', user.profile?.firstName, user.profile?.lastName);
    console.log('   Password Hash:', user.password.substring(0, 20) + '...');
    console.log('   Password Hash Length:', user.password.length);
    console.log('\n🔐 Testing password...');

    // Test the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      console.log('✅ Password is CORRECT - Login should work!');
    } else {
      console.log('❌ Password is INCORRECT - This is why login fails!');
      
      // Check if password is double-hashed
      console.log('\n🔍 Checking for double-hashing issue...');
      console.log('   Standard bcrypt hash starts with: $2a$, $2b$, or $2y$');
      console.log('   Current hash starts with:', user.password.substring(0, 4));
      
      if (user.password.length > 60) {
        console.log('   ⚠️  Hash length > 60 chars - might be double-hashed!');
      }
      
      // Try to fix by resetting password
      console.log('\n🔧 FIXING: Setting password to plain text and letting pre-save hook hash it...');
      user.password = password;
      await user.save();
      
      console.log('✅ Password has been reset!');
      
      // Test again
      const userAfterFix = await User.findOne({ email });
      const isPasswordValidNow = await bcrypt.compare(password, userAfterFix.password);
      
      if (isPasswordValidNow) {
        console.log('✅ Password is now CORRECT - Login should work now!');
        console.log('   New Hash:', userAfterFix.password.substring(0, 20) + '...');
        console.log('   New Hash Length:', userAfterFix.password.length);
      } else {
        console.log('❌ Still incorrect after fix - there may be another issue');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
};

testDheenaLogin();
