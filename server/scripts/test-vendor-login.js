require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const testVendorLogin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Test both vendor emails with the same password
    const testCredentials = [
      { email: 'vendor1@ninetyneacres.com', password: 'vendor@123' },
      { email: 'kanagaraj@gmail.com', password: 'vendor@123' }
    ];

    for (const { email, password } of testCredentials) {
      console.log(`🔐 Testing login for: ${email}`);
      console.log(`📝 Password: ${password}`);
      
      // Find user
      const user = await User.findOne({ email: email });
      
      if (!user) {
        console.log('❌ User not found');
        console.log('-------------------------------------------\n');
        continue;
      }

      console.log('✅ User found:');
      console.log('   Role:', user.role);
      console.log('   Status:', user.status);
      console.log('   Email Verified:', user.profile.emailVerified);
      
      // Test password comparison
      console.log('🔒 Testing password...');
      console.log('   Stored password hash:', user.password.substring(0, 20) + '...');
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('   Password valid:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('✅ Login would succeed');
        
        // Check if user meets vendor requirements
        if (user.role === 'agent' && user.status === 'active') {
          console.log('✅ User has vendor access');
          
          // Test JWT token generation
          const token = jwt.sign(
            { 
              userId: user._id,
              email: user.email,
              role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
          
          console.log('✅ JWT token generated:', token.substring(0, 50) + '...');
          
          // Test token verification
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ JWT token verified:', {
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role
            });
          } catch (jwtError) {
            console.log('❌ JWT token verification failed:', jwtError.message);
          }
          
        } else {
          console.log('❌ User does not have vendor access');
          console.log('   Required: role=agent, status=active');
          console.log('   Actual: role=' + user.role + ', status=' + user.status);
        }
      } else {
        console.log('❌ Login would fail - invalid password');
        
        // Let's try to check what password would work
        console.log('🔍 Checking different password variations...');
        const passwordVariations = [
          'vendor@123',
          'vendor123',
          'vendor@12345',
          'test123',
          'password123'
        ];
        
        for (const testPassword of passwordVariations) {
          const testResult = await bcrypt.compare(testPassword, user.password);
          if (testResult) {
            console.log(`✅ Found working password: ${testPassword}`);
            break;
          }
        }
      }
      
      console.log('-------------------------------------------\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('📡 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

testVendorLogin();
