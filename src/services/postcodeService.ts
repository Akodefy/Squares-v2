const BASE_URL = '/api/locations/pincode';

interface PincodeData {
  pincode: string;
  district: string;
  state: string;
  stateCode?: string;
  country: string;
  countryCode?: string;
  city?: string;
  area?: string;
  locality?: string;
  region?: string;
  taluk?: string;
  locationName?: string;
  locationType?: string;
}

interface PincodeResponse {
  success: boolean;
  data?: PincodeData;
  message?: string;
}

class PincodeService {
  async getLocationByPincode(pincode: string): Promise<PincodeResponse> {
    try {
      // Clean the pincode (remove spaces)
      const cleanPincode = pincode.replace(/\s+/g, '');
      
      if (!cleanPincode || cleanPincode.length !== 6) {
        return {
          success: false,
          message: 'Invalid pincode format. Expected 6 digits.'
        };
      }

      // Validate it's a valid Indian pincode (6 digits)
      if (!/^\d{6}$/.test(cleanPincode)) {
        return {
          success: false,
          message: 'Invalid pincode format. Expected 6 digits.'
        };
      }
      
      const apiUrl = `${BASE_URL}/${cleanPincode}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const apiResponse = await response.json();
        
        // Handle backend API response format
        if (apiResponse.success && apiResponse.data) {
          const locationData = apiResponse.data;
          
          return {
            success: true,
            data: {
              pincode: locationData.pincode || cleanPincode,
              district: locationData.district || locationData.city || '',
              state: locationData.state || '',
              stateCode: locationData.stateCode || '',
              country: locationData.country || 'India',
              countryCode: locationData.countryCode || 'IN',
              city: locationData.city || locationData.district || '',
              area: locationData.locality || locationData.area || '',
              locality: locationData.locality || '',
              region: locationData.region || '',
              taluk: locationData.taluk || '',
              locationName: locationData.locationName || locationData.locality || '',
              locationType: locationData.locationType || 'urban'
            }
          };
        } else {
          return {
            success: false,
            message: apiResponse.message || 'No data found for this pincode'
          };
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
      } else if (response.status === 429) {
        return {
          success: false,
          message: 'Too many requests. Please try again later.'
        };
      }

      return {
        success: false,
        message: 'No data found for this postcode'
      };

    } catch (error: any) {
      console.error('Postcode API Error:', error);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timeout. Please check your internet connection.'
        };
      }

      return {
        success: false,
        message: 'Failed to fetch location details. Please try again.'
      };
    }
  }

  // Validate pincode format (Indian 6-digit validation)
  validatePincode(pincode: string): boolean {
    const cleanPincode = pincode.replace(/\s+/g, '');
    
    // Indian pincode validation - should be exactly 6 digits
    return /^\d{6}$/.test(cleanPincode);
  }

  // Format pincode for display
  formatPincode(pincode: string): string {
    const cleanPincode = pincode.replace(/\s+/g, '');
    
    // For Indian pincodes, just return the clean 6-digit code
    return cleanPincode;
  }

  // Get suggestions for partial pincodes (if needed)
  async getPincodeSuggestions(partialPincode: string): Promise<string[]> {
    // This would need a different endpoint that supports search
    // For now, return empty array
    return [];
  }
}

export const pincodeService = new PincodeService();
export type { PincodeData, PincodeResponse };