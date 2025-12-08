const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const resetVendorSubscription = async (email) => {
  try {
    await connectDB();

    const User = require('../models/User');
    const Vendor = require('../models/Vendor');
    const Subscription = require('../models/Subscription');
    const Payment = require('../models/Payment');
    const LoginAttempt = require('../models/LoginAttempt');
    const bcrypt = require('bcrypt');

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`✗ User not found: ${email}`);
      return;
    }

    console.log(`✓ Found user: ${user.email} (${user._id})`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Vendor Profile: ${user.vendorProfile || 'None'}`);

    if (!user.vendorProfile) {
      console.error('✗ User does not have a vendor profile');
      return;
    }

    const vendor = await Vendor.findById(user.vendorProfile);
    if (!vendor) {
      console.error('✗ Vendor profile not found');
      return;
    }

    console.log(`\n✓ Found vendor: ${vendor.businessInfo.companyName}`);
    console.log(`  Business Type: ${vendor.businessInfo.businessType}`);
    console.log(`  Status: ${vendor.status}`);

    const newPassword = 'Squares@246';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    console.log(`\n✓ Password reset to: ${newPassword}`);

    const loginAttempts = await LoginAttempt.find({ email });
    if (loginAttempts.length > 0) {
      const deletedAttempts = await LoginAttempt.deleteMany({ email });
      console.log(`\n✓ Cleared ${deletedAttempts.deletedCount} login attempt record(s)`);
    } else {
      console.log(`\n✓ No login attempts to clear`);
    }

    const subscriptions = await Subscription.find({ user: user._id });
    console.log(`\n📋 Found ${subscriptions.length} subscription(s)`);

    if (subscriptions.length > 0) {
      for (const sub of subscriptions) {
        console.log(`  - ${sub._id}: ${sub.status} (${sub.startDate} to ${sub.endDate})`);
      }

      const deletedSubs = await Subscription.deleteMany({ user: user._id });
      console.log(`\n✓ Deleted ${deletedSubs.deletedCount} subscription(s)`);
    }

    const payments = await Payment.find({ user: user._id });
    console.log(`\n💳 Found ${payments.length} payment(s)`);

    if (payments.length > 0) {
      for (const payment of payments) {
        console.log(`  - ${payment._id}: ${payment.status} - ₹${payment.amount}`);
      }

      const deletedPayments = await Payment.deleteMany({ user: user._id });
      console.log(`\n✓ Deleted ${deletedPayments.deletedCount} payment(s)`);
    }

    console.log('\n✅ Subscription reset complete for', email);
    console.log('\nSummary:');
    console.log(`  User ID: ${user._id}`);
    console.log(`  Vendor ID: ${vendor._id}`);
    console.log(`  Password reset to: Squares@246`);
    console.log(`  Login attempts cleared`);
    console.log(`  Subscriptions deleted: ${subscriptions.length}`);
    console.log(`  Payments deleted: ${payments.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
};

const email = process.argv[2] || 'akshaya.ritera@gmail.com';
console.log(`\n🔄 Resetting subscription data for: ${email}\n`);
resetVendorSubscription(email);
