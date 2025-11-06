require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';
const SUBADMIN_EMAIL = 'admin@buildhomemart.com';
const SUBADMIN_PASSWORD = 'Admin@123';

let authToken = '';
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(endpoint, method, status, message) {
  const statusIcon = status === 'PASS' ? '✅' : '❌';
  console.log(`${statusIcon} [${method}] ${endpoint} - ${message}`);
  
  testResults.tests.push({
    endpoint,
    method,
    status,
    message
  });
  
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function login() {
  console.log('\n🔐 Authenticating SubAdmin User...');
  console.log('═'.repeat(60));
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: SUBADMIN_EMAIL,
      password: SUBADMIN_PASSWORD
    });

    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      const user = response.data.data.user;
      
      console.log('✅ Login Successful!');
      console.log(`   User: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      logTest('/auth/login', 'POST', 'PASS', 'Authentication successful');
      return true;
    } else {
      console.log('❌ Login Failed - Invalid response structure');
      logTest('/auth/login', 'POST', 'FAIL', 'Invalid response structure');
      return false;
    }
  } catch (error) {
    console.log('❌ Login Failed:', error.response?.data?.message || error.message);
    logTest('/auth/login', 'POST', 'FAIL', error.response?.data?.message || error.message);
    return false;
  }
}

async function testEndpoint(method, endpoint, description, data = null, expectedStatus = 200) {
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    let response;
    const url = `${BASE_URL}${endpoint}`;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(url, config);
        break;
      case 'POST':
        response = await axios.post(url, data, config);
        break;
      case 'PATCH':
        response = await axios.patch(url, data, config);
        break;
      case 'PUT':
        response = await axios.put(url, data, config);
        break;
      case 'DELETE':
        response = await axios.delete(url, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    if (response.status === expectedStatus && response.data.success) {
      logTest(endpoint, method, 'PASS', description);
      return response.data;
    } else {
      logTest(endpoint, method, 'FAIL', `Unexpected response: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    logTest(endpoint, method, 'FAIL', `${description} - ${errorMsg}`);
    return null;
  }
}

async function testDashboardEndpoints() {
  console.log('\n📊 Testing Dashboard Endpoints...');
  console.log('─'.repeat(60));
  
  await testEndpoint('GET', '/subadmin/dashboard', 'Get dashboard statistics');
}

async function testPropertyEndpoints() {
  console.log('\n🏠 Testing Property Management Endpoints...');
  console.log('─'.repeat(60));
  
  // Get pending properties
  const pendingProps = await testEndpoint(
    'GET', 
    '/subadmin/properties/pending?page=1&limit=10', 
    'Get pending properties'
  );

  // If there are pending properties, test approve/reject
  if (pendingProps && pendingProps.data.properties.length > 0) {
    const propertyId = pendingProps.data.properties[0]._id;
    console.log(`   Found property to test: ${propertyId}`);
    
    // Test property approval (this will modify data, be cautious)
    // Uncomment if you want to test approval
    // await testEndpoint(
    //   'POST', 
    //   `/subadmin/properties/${propertyId}/approve`, 
    //   'Approve property'
    // );
    
    // Test property rejection
    // await testEndpoint(
    //   'POST', 
    //   `/subadmin/properties/${propertyId}/reject`, 
    //   'Reject property',
    //   { reason: 'Test rejection - automated test script' }
    // );
  } else {
    console.log('   ℹ️  No pending properties found for testing approval/rejection');
  }
}

async function testSupportEndpoints() {
  console.log('\n🎫 Testing Support Ticket Endpoints...');
  console.log('─'.repeat(60));
  
  // Get open tickets
  await testEndpoint(
    'GET', 
    '/subadmin/support/tickets?page=1&limit=10&status=open', 
    'Get open support tickets'
  );

  // Get all tickets
  await testEndpoint(
    'GET', 
    '/subadmin/support/tickets?page=1&limit=10&status=all', 
    'Get all support tickets'
  );

  // Get closed tickets
  await testEndpoint(
    'GET', 
    '/subadmin/support/tickets?page=1&limit=10&status=closed', 
    'Get closed support tickets'
  );
}

async function testVendorEndpoints() {
  console.log('\n👥 Testing Vendor Performance Endpoints...');
  console.log('─'.repeat(60));
  
  await testEndpoint(
    'GET', 
    '/subadmin/vendors/performance', 
    'Get vendor performance metrics'
  );
}

async function testContentModerationEndpoints() {
  console.log('\n📝 Testing Content Moderation Endpoints...');
  console.log('─'.repeat(60));
  
  await testEndpoint(
    'GET', 
    '/subadmin/content/reports', 
    'Get content reports'
  );
}

async function testPromotionEndpoints() {
  console.log('\n🎯 Testing Promotion Management Endpoints...');
  console.log('─'.repeat(60));
  
  await testEndpoint(
    'GET', 
    '/subadmin/promotions/pending', 
    'Get pending promotions'
  );
}

async function testNotificationEndpoints() {
  console.log('\n🔔 Testing Notification Endpoints...');
  console.log('─'.repeat(60));
  
  // Test sending notification (be cautious with this in production)
  // Uncomment to test
  // await testEndpoint(
  //   'POST', 
  //   '/subadmin/notifications/send', 
  //   'Send notification',
  //   {
  //     title: 'Test Notification',
  //     message: 'This is a test notification from automated test script',
  //     type: 'general',
  //     recipients: 'all'
  //   }
  // );
  
  console.log('   ℹ️  Notification sending test skipped (uncomment to enable)');
}

async function testReportEndpoints() {
  console.log('\n📈 Testing Report Generation Endpoints...');
  console.log('─'.repeat(60));
  
  // Test city report with common city names
  const testCities = ['Mumbai', 'Delhi', 'Bangalore'];
  
  for (const city of testCities) {
    await testEndpoint(
      'GET', 
      `/subadmin/reports/city/${city}`, 
      `Generate report for ${city}`
    );
  }

  // Test with date range
  const startDate = new Date('2024-01-01').toISOString();
  const endDate = new Date().toISOString();
  
  await testEndpoint(
    'GET', 
    `/subadmin/reports/city/Mumbai?startDate=${startDate}&endDate=${endDate}`, 
    'Generate report with date range'
  );

  // Test admin report generation endpoint
  await testEndpoint(
    'POST',
    '/admin/reports/generate',
    'Generate admin report',
    {
      reportType: 'city_regional',
      city: 'Mumbai',
      metrics: ['Properties by City', 'User Distribution'],
      formats: ['pdf'],
      customName: 'Test Report - SubAdmin API'
    }
  );
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling...');
  console.log('─'.repeat(60));
  
  // Test with invalid property ID
  try {
    await axios.post(
      `${BASE_URL}/subadmin/properties/invalid-id/approve`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    logTest('/subadmin/properties/invalid-id/approve', 'POST', 'FAIL', 'Should return error for invalid ID');
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404 || error.response?.status === 500) {
      logTest('/subadmin/properties/invalid-id/approve', 'POST', 'PASS', 'Correctly handles invalid property ID');
    } else {
      logTest('/subadmin/properties/invalid-id/approve', 'POST', 'FAIL', 'Unexpected error handling');
    }
  }

  // Test without authentication
  try {
    await axios.get(`${BASE_URL}/subadmin/dashboard`);
    logTest('/subadmin/dashboard', 'GET', 'FAIL', 'Should require authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('/subadmin/dashboard', 'GET', 'PASS', 'Correctly requires authentication');
    } else {
      logTest('/subadmin/dashboard', 'GET', 'FAIL', 'Unexpected authentication handling');
    }
  }
}

function printSummary() {
  console.log('\n\n📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    console.log('─'.repeat(60));
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`   [${t.method}] ${t.endpoint}`);
        console.log(`   └─ ${t.message}\n`);
      });
  }
  
  console.log('\n✨ Testing completed!\n');
}

async function runAllTests() {
  console.log('\n🚀 SUBADMIN PORTAL API TESTING');
  console.log('═'.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`SubAdmin: ${SUBADMIN_EMAIL}`);
  console.log('═'.repeat(60));

  // Login first
  const loginSuccess = await login();
  
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication. Please check credentials.');
    process.exit(1);
  }

  // Run all test suites
  await testDashboardEndpoints();
  await testPropertyEndpoints();
  await testSupportEndpoints();
  await testVendorEndpoints();
  await testContentModerationEndpoints();
  await testPromotionEndpoints();
  await testNotificationEndpoints();
  await testReportEndpoints();
  await testErrorHandling();

  // Print summary
  printSummary();
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  process.exit(1);
});
