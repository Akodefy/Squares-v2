require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const convertUserToSubAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // List all superadmin users
    console.log('📋 Current SuperAdmin Users:');
    const superAdminUsers = await User.find({ role: 'superadmin' })
      .select('email role status profile.firstName profile.lastName');
    
    if (superAdminUsers.length === 0) {
      console.log('❌ No superadmin users found!');
      rl.close();
      return;
    }

    superAdminUsers.forEach((user, index) => {
      console.log(`\n   ${index + 1}. ${user.email}`);
      console.log(`      Name: ${user.profile.firstName} ${user.profile.lastName}`);
      console.log(`      Status: ${user.status}`);
      console.log(`      ID: ${user._id}`);
    });

    console.log('\n');
    const answer = await question('Enter the email of the user to convert to SubAdmin (or "cancel" to exit): ');

    if (answer.toLowerCase() === 'cancel') {
      console.log('❌ Operation cancelled');
      rl.close();
      return;
    }

    const userToConvert = await User.findOne({ email: answer.trim() });

    if (!userToConvert) {
      console.log(`❌ User with email "${answer}" not found!`);
      rl.close();
      return;
    }

    if (userToConvert.role !== 'superadmin') {
      console.log(`⚠️  User "${answer}" is not a superadmin (current role: ${userToConvert.role})`);
      rl.close();
      return;
    }

    console.log(`\n🔄 Converting ${userToConvert.email} from SuperAdmin to SubAdmin...`);
    
    userToConvert.role = 'subadmin';
    await userToConvert.save();

    console.log('✅ User successfully converted to SubAdmin!');
    console.log(`\n👤 Updated User Details:`);
    console.log(`   Email: ${userToConvert.email}`);
    console.log(`   Role: ${userToConvert.role}`);
    console.log(`   Name: ${userToConvert.profile.firstName} ${userToConvert.profile.lastName}`);

    // Show remaining superadmin users
    console.log('\n📊 Remaining SuperAdmin Users:');
    const remainingSuperAdmins = await User.find({ role: 'superadmin' })
      .select('email profile.firstName profile.lastName');
    
    remainingSuperAdmins.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.profile.firstName} ${user.profile.lastName}`);
    });

    console.log('\n🎉 Conversion completed successfully!');
    console.log('💡 Please refresh your browser to see the updated user role.');

    rl.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    rl.close();
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
convertUserToSubAdmin();
