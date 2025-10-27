// Constants
const API_KEY = 'm9FolcWxL5a5mYRJSkZHH5rj762itFpwGXfwQjh0';
const BASE_URL_UK = 'https://postcode.apitier.com/v1/postcodes';
const BASE_URL_IN = 'https://pincode.apitier.com/v1/in/places/pincode';

// Function to get location from postcode
async function getLocationFromPostcode(postcode) {
  try {
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    if (!cleanPostcode) {
      return {
        success: false,
        message: 'Postcode is required'
      };
    }

    // Check if it's an Indian pincode (6 digits)
    const isIndianPincode = /^\d{6}$/.test(cleanPostcode);
    
    console.log(`Making API call for: ${cleanPostcode} (${isIndianPincode ? 'Indian' : 'UK/International'})`);
    
    let url;
    if (isIndianPincode) {
      url = `${BASE_URL_IN}/${cleanPostcode}`;
    } else {
      url = `${BASE_URL_UK}/${cleanPostcode}`;
    }
    
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response ok: ${response.ok}`);
    
    if (response.ok) {
      const apiResponse = await response.json();
      console.log('Raw API Response:', JSON.stringify(apiResponse, null, 2));
      
      // Handle Indian pincode API response format
      if (isIndianPincode) {
        if (apiResponse.status === 200 && apiResponse.results && apiResponse.results.length > 0) {
          const locationData = apiResponse.results[0];
          
          return {
            success: true,
            data: {
              postcode: locationData.pincode || cleanPostcode,
              district: locationData.district_name || locationData.district || '',
              state: locationData.state_name || locationData.state || '',
              country: locationData.country || 'India',
              lat: parseFloat(locationData.latitude || '0'),
              lng: parseFloat(locationData.longitude || '0'),
              area: locationData.place_name || locationData.area || '',
              region: locationData.state_name || locationData.state || ''
            }
          };
        } else {
          return {
            success: false,
            message: apiResponse.message || 'No data found for this pincode'
          };
        }
      } 
      // Handle UK/International postcode API response format
      else {
        if (apiResponse.status === 200 && apiResponse.result) {
          const locationData = apiResponse.result;
          
          return {
            success: true,
            data: {
              postcode: locationData.postcode || cleanPostcode,
              district: locationData.district || locationData.ward || '',
              state: locationData.county || locationData.state || '',
              country: locationData.country || 'UK',
              lat: parseFloat(locationData.geocode?.lattitude || '0'),
              lng: parseFloat(locationData.geocode?.longitude || '0'),
              area: locationData.ward || locationData.district || '',
              region: locationData.county || locationData.state || ''
            }
          };
        } else {
          return {
            success: false,
            message: apiResponse.message || 'Invalid API response format'
          };
        }
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch location'
    };
  }
}

// Test the postcode API with various test cases
async function testPostcodeAPI() {
  console.log('🧪 Testing Postcode API Service...\n');

  const testCodes = [
    '641664', // Indian pincode (Tiruppur, Tamil Nadu)
    'PL11DN', // UK postcode (Plymouth, Devon)
    '110001', // Indian pincode (New Delhi)
    'SW1A 1AA', // UK postcode (Westminster, London)
    '400001', // Indian pincode (Mumbai)
    'invalid', // Invalid postcode
  ];

  for (const testCode of testCodes) {
    console.log(`\n🔍 Testing: ${testCode}`);
    console.log('─'.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await getLocationFromPostcode(testCode);
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
}

// Run the test
testPostcodeAPI().then(() => {
  console.log('\n\n✨ Testing completed!');
}).catch(error => {
  console.error('🚨 Test suite failed:', error);
});