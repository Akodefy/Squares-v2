// Test both UK and Indian postcode APIs
async function testBothAPIs() {
  console.log('🧪 Testing Updated Postcode Service (Dual API)...\n');

  const testCases = [
    { code: '641664', type: 'Indian', expected: 'Tamil Nadu' },
    { code: 'PL11DN', type: 'UK', expected: 'Devon' },
    { code: '110001', type: 'Indian', expected: 'Delhi' },
    { code: 'SW1A 1AA', type: 'UK', expected: 'London' },
    { code: '400001', type: 'Indian', expected: 'Maharashtra' },
    { code: '560001', type: 'Indian', expected: 'Karnataka' },
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.code} (${testCase.type})`);
    console.log('─'.repeat(50));
    
    try {
      const result = await getLocationFromPostcode(testCase.code);
      
      if (result.success) {
        console.log('✅ Success!');
        console.log(`📍 Location: ${result.data?.area || result.data?.district}, ${result.data?.district}, ${result.data?.state}, ${result.data?.country}`);
        console.log(`📮 Postcode: ${result.data?.postcode}`);
        console.log(`🏛️ Region: ${result.data?.region}`);
        if (result.data?.lat !== 0 && result.data?.lng !== 0) {
          console.log(`🗺️ Coordinates: ${result.data?.lat}, ${result.data?.lng}`);
        }
        
        // Verify expected data
        if (result.data?.state?.includes(testCase.expected) || result.data?.region?.includes(testCase.expected)) {
          console.log('🎯 Expected data found!');
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

// Updated function to match the service logic
async function getLocationFromPostcode(postcode) {
  try {
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    if (!cleanPostcode || cleanPostcode.length < 4) {
      return {
        success: false,
        message: 'Invalid postcode format'
      };
    }

    // Check if it's an Indian pincode (6 digits)
    const isIndianPincode = /^\d{6}$/.test(cleanPostcode);
    
    let apiUrl;
    let headers = {
      'Content-Type': 'application/json',
    };

    if (isIndianPincode) {
      // Use Indian pincode API (no auth required)
      apiUrl = `https://api.postalpincode.in/pincode/${cleanPostcode}`;
    } else {
      // Use UK/international postcode API (requires auth)
      apiUrl = `https://postcode.apitier.com/v1/postcodes/${cleanPostcode}`;
      headers['X-API-Key'] = 'm9FolcWxL5a5mYRJSkZHH5rj762itFpwGXfwQjh0';
    }

    console.log(`🔗 API URL: ${apiUrl}`);
    console.log(`📋 Headers: ${JSON.stringify(headers)}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const apiResponse = await response.json();
      
      // Handle Indian pincode API response format
      if (isIndianPincode) {
        if (Array.isArray(apiResponse) && apiResponse.length > 0) {
          const result = apiResponse[0];
          if (result.Status === 'Success' && result.PostOffice && result.PostOffice.length > 0) {
            const locationData = result.PostOffice[0];
            
            return {
              success: true,
              data: {
                postcode: locationData.Pincode || cleanPostcode,
                district: locationData.District || '',
                state: locationData.State || '',
                country: locationData.Country || 'India',
                lat: 0, // This API doesn't provide coordinates
                lng: 0, // This API doesn't provide coordinates
                area: locationData.Name || '',
                region: locationData.Region || locationData.Division || ''
              }
            };
          } else {
            return {
              success: false,
              message: result.Message || 'No data found for this pincode'
            };
          }
        } else {
          return {
            success: false,
            message: 'Invalid response format from pincode API'
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
    }

    if (response.status === 404) {
      return {
        success: false,
        message: 'Postcode not found'
      };
    } else if (response.status === 401) {
      return {
        success: false,
        message: 'API key is invalid'
      };
    }

    return {
      success: false,
      message: `HTTP ${response.status}: ${response.statusText}`
    };

  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch location'
    };
  }
}

testBothAPIs();