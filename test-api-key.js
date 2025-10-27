// Test API key validation with a simple fetch
async function testAPIKey() {
  const API_KEY = 'm9FolcWxL5a5mYRJSkZHH5rj762itFpwGXfwQjh0';
  
  console.log('Testing API key validity...\n');
  
  // Test different formats
  const testConfigs = [
    {
      name: 'Query parameter',
      url: `https://postcode.apitier.com/v1/postcodes/PL11DN?api_key=${API_KEY}`,
      headers: {}
    },
    {
      name: 'X-API-Key header',
      url: 'https://postcode.apitier.com/v1/postcodes/PL11DN',
      headers: { 'X-API-Key': API_KEY }
    },
    {
      name: 'Authorization header',
      url: 'https://postcode.apitier.com/v1/postcodes/PL11DN',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    },
    {
      name: 'api-key header',
      url: 'https://postcode.apitier.com/v1/postcodes/PL11DN',
      headers: { 'api-key': API_KEY }
    }
  ];
  
  for (const config of testConfigs) {
    console.log(`🧪 Testing: ${config.name}`);
    console.log(`🔗 URL: ${config.url}`);
    console.log(`📋 Headers:`, config.headers);
    
    try {
      const response = await fetch(config.url, {
        method: 'GET',
        headers: config.headers
      });
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! API key format is correct');
        console.log('📦 Sample response:', JSON.stringify(data, null, 2));
        break;
      } else {
        const errorText = await response.text();
        console.log('❌ Failed');
        console.log('📝 Error:', errorText);
      }
    } catch (error) {
      console.log('🚨 Fetch error:', error.message);
    }
    
    console.log('─'.repeat(50));
  }
}

testAPIKey();