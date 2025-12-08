const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    const User = require('../models/User');
    const LoginAttempt = require('../models/LoginAttempt');

    const email = 'akshaya.ritera@gmail.com';
    const newPassword = 'Squares@246';

    const user = await User.findOne({ email });
    if (!user) {
      console.error('✗ User not found');
      process.exit(1);
    }

    console.log(`\n✓ Found user: ${email}`);
    console.log(`  Current password hash: ${user.password.substring(0, 20)}...`);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    console.log(`\n✓ Password updated successfully`);
    console.log(`  New password: ${newPassword}`);
    console.log(`  New hash: ${hashedPassword.substring(0, 20)}...`);

    const testMatch = await bcrypt.compare(newPassword, user.password);
    console.log(`\n✓ Password verification: ${testMatch ? 'PASSED' : 'FAILED'}`);

    await LoginAttempt.deleteMany({ email });
    console.log(`✓ Login attempts cleared`);

    console.log(`\n✅ Password reset complete!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

resetPassword();
