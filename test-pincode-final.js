// Test the updated pincode service with Indian pincodes only
const { pincodeService } = require('./src/services/postcodeService.js');

async function testPincodeService() {
  console.log('🧪 Testing Indian Pincode Service...\n');

  const testPincodes = [
    '641664', // Tiruppur, Tamil Nadu
    '110001', // New Delhi
    '400001', // Mumbai, Maharashtra
    '560001', // Bangalore, Karnataka
    '600001', // Chennai, Tamil Nadu
    '700001', // Kolkata, West Bengal
    '411001', // Pune, Maharashtra
    '500001', // Hyderabad, Telangana
  ];

  for (const pincode of testPincodes) {
    console.log(`\n🔍 Testing Pincode: ${pincode}`);
    console.log('─'.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await pincodeService.getLocationByPincode(pincode);
      const endTime = Date.now();
      
      console.log(`⏱️ Response time: ${endTime - startTime}ms`);
      
      if (result.success && result.data) {
        console.log('✅ Success!');
        console.log(`📮 Pincode: ${result.data.pincode}`);
        console.log(`📍 Area: ${result.data.area}`);
        console.log(`🏙️ District: ${result.data.district}`);
        console.log(`🗺️ State: ${result.data.state}`);
        console.log(`🌍 Country: ${result.data.country}`);
        if (result.data.region) {
          console.log(`📊 Region: ${result.data.region}`);
        }
      } else {
        console.log('❌ Failed');
        console.log(`💬 Message: ${result.message}`);
      }
    } catch (error) {
      console.log('🚨 Error occurred');
      console.log(`💥 Error: ${error.message}`);
    }
  }

  // Test validation function
  console.log('\n\n🔧 Testing pincode validation...\n');
  const validationTests = [
    '641664', // Valid
    '110001', // Valid
    '12345',  // Invalid (5 digits)
    '1234567', // Invalid (7 digits)
    'abc123', // Invalid (letters)
    '',       // Invalid (empty)
  ];

  validationTests.forEach(pincode => {
    const isValid = pincodeService.validatePincode(pincode);
    console.log(`${pincode.padEnd(10)} → ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });

  console.log('\n\n✨ Testing completed!');
}

testPincodeService().catch(error => {
  console.error('🚨 Test suite failed:', error);
});