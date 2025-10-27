// Test the new Indian pincode API
async function testIndianPincodeAPI() {
  console.log('🧪 Testing Indian Pincode API (api.postalpincode.in)...\n');

  const testPincodes = [
    '641664', // Tiruppur, Tamil Nadu
    '110001', // New Delhi
    '400001', // Mumbai
    '560001', // Bangalore
    '600001', // Chennai
    '700001', // Kolkata
  ];

  for (const pincode of testPincodes) {
    console.log(`\n🔍 Testing pincode: ${pincode}`);
    console.log('─'.repeat(50));
    
    try {
      const url = `https://api.postalpincode.in/pincode/${pincode}`;
      console.log(`🔗 URL: ${url}`);
      
      const startTime = Date.now();
      const response = await fetch(url);
      const endTime = Date.now();
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`⏱️ Response time: ${endTime - startTime}ms`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success!');
        console.log('📦 Raw response:', JSON.stringify(data, null, 2));
        
        // Parse the response structure
        if (data && Array.isArray(data) && data.length > 0) {
          const result = data[0];
          if (result.Status === 'Success' && result.PostOffice && result.PostOffice.length > 0) {
            const postOffice = result.PostOffice[0];
            console.log(`📍 Location: ${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`);
            console.log(`📮 Pincode: ${postOffice.Pincode}`);
            console.log(`🏛️ Division: ${postOffice.Division}`);
            console.log(`🏢 Region: ${postOffice.Region}`);
          }
        }
      } else {
        console.log('❌ Failed');
        const errorText = await response.text();
        console.log('📝 Error response:', errorText);
      }
    } catch (error) {
      console.log('🚨 Error occurred');
      console.log(`💥 Error: ${error.message}`);
    }
  }
}

testIndianPincodeAPI();