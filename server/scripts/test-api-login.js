require('dotenv').config();
const fetch = require('node-fetch');

const testVendorLoginAPI = async () => {
  const API_BASE = 'http://localhost:8000/api';
  
  console.log('🧪 Testing Vendor Login API Endpoints\n');
  
  const testCredentials = [
    { 
      email: 'vendor1@ninetyneacres.com', 
      password: 'vendor@123',
      description: 'First vendor account'
    },
    { 
      email: 'kanagaraj@gmail.com', 
      password: 'vendor123',
      description: 'Second vendor account'
    },
    { 
      email: 'kanagaraj@gmail.com', 
      password: 'vendor@123',
      description: 'Second vendor account with wrong password (should fail)'
    }
  ];

  for (const { email, password, description } of testCredentials) {
    console.log(`🔐 Testing login: ${description}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    try {
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.success) {
        console.log('✅ Login successful!');
        console.log('   User ID:', loginData.data?.user?.id);
        console.log('   Email:', loginData.data?.user?.email);
        console.log('   Role:', loginData.data?.user?.role);
        console.log('   Token received:', !!loginData.data?.token);
        
        // Test accessing vendor endpoints
        if (loginData.data?.token) {
          console.log('🔍 Testing vendor endpoint access...');
          
          const vendorResponse = await fetch(`${API_BASE}/vendors/statistics`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.data.token}`,
            },
          });

          if (vendorResponse.ok) {
            const vendorData = await vendorResponse.json();
            console.log('✅ Vendor endpoint accessible!');
            console.log('   Statistics retrieved:', !!vendorData.data);
          } else {
            const errorData = await vendorResponse.json().catch(() => ({}));
            console.log('❌ Vendor endpoint failed:', vendorResponse.status);
            console.log('   Error:', errorData.message || 'Unknown error');
          }
        }
        
      } else {
        console.log('❌ Login failed');
        console.log('   Status:', loginResponse.status);
        console.log('   Message:', loginData.message || 'Unknown error');
      }
      
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
    
    console.log('-------------------------------------------\n');
  }
};

// Run the test
testVendorLoginAPI();
