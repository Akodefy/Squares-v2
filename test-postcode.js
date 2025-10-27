import { pincodeService } from './src/services/postcodeService.js';

// Test the postcode API with various test cases
async function testPostcodeAPI() {
  console.log('🧪 Testing Postcode API Service...\n');

  const testcodes = [
  '641664', // Indian pincode (Tiruppur, Tamil Nadu)
  'PL11DN', // UK postcode (Plymouth, Devon)
  '110001', // Indian pincode (New Delhi)
  'SW1A 1AA', // UK postcode (Westminster, London)
  '400001', // Indian pincode (Mumbai)
  'invalid', // Invalid postcode
];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.code} (${testCase.description})`);
    console.log('─'.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await postcodeService.getLocationByPostcode(testCase.code);
      const endTime = Date.now();
      
      console.log(`⏱️ Response time: ${endTime - startTime}ms`);
      
      if (result.success) {
        console.log('✅ Success!');
        console.log(`📍 Location: ${result.data?.district}, ${result.data?.state}, ${result.data?.country}`);
        console.log(`🗺️ Coordinates: ${result.data?.lat}, ${result.data?.lng}`);
        console.log(`📮 Formatted: ${result.data?.postcode}`);
        if (result.data?.area) {
          console.log(`🏘️ Area: ${result.data.area}`);
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
  console.log('\n\n🔧 Testing validation function...\n');
  const validationTests = [
    'PL11DN',
    '560001', 
    'SW1A 1AA',
    '12345',
    'INVALID123',
    'AB',
    ''
  ];

  validationTests.forEach(code => {
    const isValid = postcodeService.validatePostcode(code);
    console.log(`${code.padEnd(10)} → ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });

  // Test formatting function
  console.log('\n\n🎨 Testing formatting function...\n');
  const formatTests = [
    'PL11DN',
    'SW1A1AA', 
    '560001',
    'abc123def'
  ];

  formatTests.forEach(code => {
    const formatted = postcodeService.formatPostcode(code);
    console.log(`${code.padEnd(10)} → ${formatted}`);
  });
}

// Test the API directly with fetch
async function testAPIDirectly() {
  console.log('\n\n🌐 Testing API directly with fetch...\n');
  
  const testCode = 'PL11DN';
  const apiKey = 'Ytghien0MP2ARJEAzVnrW24MEt2T5cea6kHZ8Mcw';
  const url = `https://postcode.apitier.com/v1/postcodes/${testCode}?x-api-key=${apiKey}`;
  
  console.log(`🔗 URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📝 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (error) {
    console.log('🚨 Fetch error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testPostcodeAPI();
    await testAPIDirectly();
    console.log('\n\n✨ Testing completed!');
  } catch (error) {
    console.error('🚨 Test suite failed:', error);
  }
}

// Execute if run directly
if (typeof module !== 'undefined' && require.main === module) {
  runAllTests();
}

export { testPostcodeAPI, testAPIDirectly, runAllTests };