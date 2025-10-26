const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

// Sample location names data - In production, this would come from a database
const locationNamesDatabase = {
  'mumbai-island-city': [
    { id: 'fort', name: 'Fort', type: 'urban', talukId: 'mumbai-island-city', cityId: 'mumbai-city', districtId: 'mumbai', pincode: '400001' },
    { id: 'colaba', name: 'Colaba', type: 'urban', talukId: 'mumbai-island-city', cityId: 'mumbai-city', districtId: 'mumbai', pincode: '400005' },
    { id: 'nariman-point', name: 'Nariman Point', type: 'urban', talukId: 'mumbai-island-city', cityId: 'mumbai-city', districtId: 'mumbai', pincode: '400021' }
  ],
  'andheri': [
    { id: 'andheri-west', name: 'Andheri West', type: 'urban', talukId: 'andheri', cityId: 'mumbai-suburban', districtId: 'mumbai', pincode: '400053' },
    { id: 'andheri-east', name: 'Andheri East', type: 'urban', talukId: 'andheri', cityId: 'mumbai-suburban', districtId: 'mumbai', pincode: '400069' },
    { id: 'versova', name: 'Versova', type: 'urban', talukId: 'andheri', cityId: 'mumbai-suburban', districtId: 'mumbai', pincode: '400061' }
  ],
  'borivali': [
    { id: 'borivali-west', name: 'Borivali West', type: 'urban', talukId: 'borivali', cityId: 'mumbai-suburban', districtId: 'mumbai', pincode: '400092' },
    { id: 'borivali-east', name: 'Borivali East', type: 'urban', talukId: 'borivali', cityId: 'mumbai-suburban', districtId: 'mumbai', pincode: '400066' }
  ],
  'bangalore-south': [
    { id: 'koramangala', name: 'Koramangala', type: 'urban', talukId: 'bangalore-south', cityId: 'bangalore', districtId: 'bangalore-urban', pincode: '560034' },
    { id: 'jayanagar', name: 'Jayanagar', type: 'urban', talukId: 'bangalore-south', cityId: 'bangalore', districtId: 'bangalore-urban', pincode: '560011' },
    { id: 'btm-layout', name: 'BTM Layout', type: 'urban', talukId: 'bangalore-south', cityId: 'bangalore', districtId: 'bangalore-urban', pincode: '560029' }
  ],
  'bangalore-north': [
    { id: 'hebbal', name: 'Hebbal', type: 'urban', talukId: 'bangalore-north', cityId: 'bangalore', districtId: 'bangalore-urban', pincode: '560024' },
    { id: 'yelahanka', name: 'Yelahanka', type: 'town', talukId: 'bangalore-north', cityId: 'bangalore', districtId: 'bangalore-urban', pincode: '560064' }
  ],
  'tiruppur-taluk': [
    { id: 'tiruppur-town', name: 'Tiruppur Town', type: 'town', talukId: 'tiruppur-taluk', cityId: 'tiruppur-city', districtId: 'tiruppur', pincode: '641601' },
    { id: 'avinashi-road', name: 'Avinashi Road', type: 'urban', talukId: 'tiruppur-taluk', cityId: 'tiruppur-city', districtId: 'tiruppur', pincode: '641603' },
    { id: 'dharapuram-road', name: 'Dharapuram Road', type: 'urban', talukId: 'tiruppur-taluk', cityId: 'tiruppur-city', districtId: 'tiruppur', pincode: '641602' }
  ]
};

// Sample localities data - In production, this would come from a database (legacy - keeping for compatibility)
const localitiesDatabase = {
  'mumbai': [
    { id: "bandra-west", name: "Bandra West", cityId: "mumbai", pincode: "400050", area: "Bandra" },
    { id: "andheri-east", name: "Andheri East", cityId: "mumbai", pincode: "400069", area: "Andheri" },
    { id: "powai", name: "Powai", cityId: "mumbai", pincode: "400076", area: "Powai" },
    { id: "malad-west", name: "Malad West", cityId: "mumbai", pincode: "400064", area: "Malad" },
    { id: "juhu", name: "Juhu", cityId: "mumbai", pincode: "400049", area: "Juhu" },
    { id: "santacruz-east", name: "Santacruz East", cityId: "mumbai", pincode: "400055", area: "Santacruz" },
    { id: "goregaon-west", name: "Goregaon West", cityId: "mumbai", pincode: "400062", area: "Goregaon" },
    { id: "versova", name: "Versova", cityId: "mumbai", pincode: "400061", area: "Versova" },
    { id: "kandivali-east", name: "Kandivali East", cityId: "mumbai", pincode: "400101", area: "Kandivali" },
    { id: "borivali-west", name: "Borivali West", cityId: "mumbai", pincode: "400092", area: "Borivali" }
  ],
  'bangalore': [
    { id: "koramangala", name: "Koramangala", cityId: "bangalore", pincode: "560034", area: "Koramangala" },
    { id: "whitefield", name: "Whitefield", cityId: "bangalore", pincode: "560066", area: "Whitefield" },
    { id: "indiranagar", name: "Indiranagar", cityId: "bangalore", pincode: "560038", area: "Indiranagar" },
    { id: "jayanagar", name: "Jayanagar", cityId: "bangalore", pincode: "560011", area: "Jayanagar" },
    { id: "electronic-city", name: "Electronic City", cityId: "bangalore", pincode: "560100", area: "Electronic City" },
    { id: "hsr-layout", name: "HSR Layout", cityId: "bangalore", pincode: "560102", area: "HSR Layout" },
    { id: "marathahalli", name: "Marathahalli", cityId: "bangalore", pincode: "560037", area: "Marathahalli" },
    { id: "btm-layout", name: "BTM Layout", cityId: "bangalore", pincode: "560029", area: "BTM Layout" },
    { id: "jp-nagar", name: "JP Nagar", cityId: "bangalore", pincode: "560078", area: "JP Nagar" },
    { id: "banashankari", name: "Banashankari", cityId: "bangalore", pincode: "560070", area: "Banashankari" }
  ],
  'pune': [
    { id: "kothrud", name: "Kothrud", cityId: "pune", pincode: "411038", area: "Kothrud" },
    { id: "hinjewadi", name: "Hinjewadi", cityId: "pune", pincode: "411057", area: "Hinjewadi" },
    { id: "wakad", name: "Wakad", cityId: "pune", pincode: "411057", area: "Wakad" },
    { id: "baner", name: "Baner", cityId: "pune", pincode: "411045", area: "Baner" },
    { id: "aundh", name: "Aundh", cityId: "pune", pincode: "411007", area: "Aundh" },
    { id: "viman-nagar", name: "Viman Nagar", cityId: "pune", pincode: "411014", area: "Viman Nagar" },
    { id: "magarpatta", name: "Magarpatta", cityId: "pune", pincode: "411028", area: "Magarpatta" },
    { id: "kalyani-nagar", name: "Kalyani Nagar", cityId: "pune", pincode: "411006", area: "Kalyani Nagar" }
  ],
  'delhi': [
    { id: "cp", name: "Connaught Place", cityId: "delhi", pincode: "110001", area: "Central Delhi" },
    { id: "karol-bagh", name: "Karol Bagh", cityId: "delhi", pincode: "110005", area: "Karol Bagh" },
    { id: "lajpat-nagar", name: "Lajpat Nagar", cityId: "delhi", pincode: "110024", area: "Lajpat Nagar" },
    { id: "rohini", name: "Rohini", cityId: "delhi", pincode: "110085", area: "Rohini" },
    { id: "dwarka", name: "Dwarka", cityId: "delhi", pincode: "110075", area: "Dwarka" },
    { id: "saket", name: "Saket", cityId: "delhi", pincode: "110017", area: "Saket" },
    { id: "vasant-kunj", name: "Vasant Kunj", cityId: "delhi", pincode: "110070", area: "Vasant Kunj" },
    { id: "gurgaon", name: "Gurgaon", cityId: "delhi", pincode: "122001", area: "Gurgaon" }
  ],
  'chennai': [
    { id: "anna-nagar", name: "Anna Nagar", cityId: "chennai", pincode: "600040", area: "Anna Nagar" },
    { id: "t-nagar", name: "T. Nagar", cityId: "chennai", pincode: "600017", area: "T. Nagar" },
    { id: "adyar", name: "Adyar", cityId: "chennai", pincode: "600020", area: "Adyar" },
    { id: "velachery", name: "Velachery", cityId: "chennai", pincode: "600042", area: "Velachery" },
    { id: "omr", name: "OMR (IT Corridor)", cityId: "chennai", pincode: "600096", area: "OMR" },
    { id: "tambaram", name: "Tambaram", cityId: "chennai", pincode: "600045", area: "Tambaram" },
    { id: "porur", name: "Porur", cityId: "chennai", pincode: "600116", area: "Porur" },
    { id: "chrompet", name: "Chrompet", cityId: "chennai", pincode: "600044", area: "Chrompet" }
  ],
  'new-delhi': [
    { id: "cp", name: "Connaught Place", cityId: "new-delhi", pincode: "110001", area: "Central Delhi" },
    { id: "karol-bagh", name: "Karol Bagh", cityId: "new-delhi", pincode: "110005", area: "Karol Bagh" },
    { id: "lajpat-nagar", name: "Lajpat Nagar", cityId: "new-delhi", pincode: "110024", area: "Lajpat Nagar" },
    { id: "rohini", name: "Rohini", cityId: "new-delhi", pincode: "110085", area: "Rohini" },
    { id: "dwarka", name: "Dwarka", cityId: "new-delhi", pincode: "110075", area: "Dwarka" },
    { id: "saket", name: "Saket", cityId: "new-delhi", pincode: "110017", area: "Saket" }
  ]
};

// Sample pincode database - In production, this would come from a comprehensive pincode database
const pincodeDatabase = {
  '400050': {
    pincode: '400050',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    locality: 'Bandra West',
    area: 'Bandra',
    district: 'Mumbai Suburban'
  },
  '560034': {
    pincode: '560034',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    locality: 'Koramangala',
    area: 'Koramangala',
    district: 'Bangalore Urban'
  },
  '411038': {
    pincode: '411038',
    country: 'India',
    state: 'Maharashtra',
    city: 'Pune',
    locality: 'Kothrud',
    area: 'Kothrud',
    district: 'Pune'
  },
  '110001': {
    pincode: '110001',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    locality: 'Connaught Place',
    area: 'Central Delhi',
    district: 'New Delhi'
  },
  '600040': {
    pincode: '600040',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    locality: 'Anna Nagar',
    area: 'Anna Nagar',
    district: 'Chennai'
  }
};

// @route   GET /api/locations/cities/:districtId
// @desc    Get cities by district
// @access  Public
router.get('/cities/:districtId', asyncHandler(async (req, res) => {
  try {
    const { districtId } = req.params;
    const { state } = req.query;
    
    // Normalize district ID
    const normalizedDistrictId = districtId.toLowerCase().replace(/\s+/g, '-');
    
    // Enhanced cities database with more comprehensive mapping
    const citiesDatabase = {
      'mumbai': [
        { id: 'mumbai-city', name: 'Mumbai City', districtId: 'mumbai', stateCode: 'MH', countryCode: 'IN' },
        { id: 'thane', name: 'Thane', districtId: 'mumbai', stateCode: 'MH', countryCode: 'IN' },
        { id: 'navi-mumbai', name: 'Navi Mumbai', districtId: 'mumbai', stateCode: 'MH', countryCode: 'IN' }
      ],
      'pune': [
        { id: 'pune-city', name: 'Pune City', districtId: 'pune', stateCode: 'MH', countryCode: 'IN' },
        { id: 'pimpri-chinchwad', name: 'Pimpri-Chinchwad', districtId: 'pune', stateCode: 'MH', countryCode: 'IN' },
        { id: 'lonavala', name: 'Lonavala', districtId: 'pune', stateCode: 'MH', countryCode: 'IN' }
      ],
      'bangalore-urban': [
        { id: 'bangalore', name: 'Bangalore', districtId: 'bangalore-urban', stateCode: 'KA', countryCode: 'IN' },
        { id: 'bengaluru', name: 'Bengaluru', districtId: 'bangalore-urban', stateCode: 'KA', countryCode: 'IN' }
      ],
      'chennai': [
        { id: 'chennai-city', name: 'Chennai City', districtId: 'chennai', stateCode: 'TN', countryCode: 'IN' },
        { id: 'tambaram', name: 'Tambaram', districtId: 'chennai', stateCode: 'TN', countryCode: 'IN' }
      ],
      'coimbatore': [
        { id: 'coimbatore-city', name: 'Coimbatore City', districtId: 'coimbatore', stateCode: 'TN', countryCode: 'IN' }
      ],
      'tiruppur': [
        { id: 'tiruppur-city', name: 'Tiruppur City', districtId: 'tiruppur', stateCode: 'TN', countryCode: 'IN' }
      ],
      'erode': [
        { id: 'erode-city', name: 'Erode City', districtId: 'erode', stateCode: 'TN', countryCode: 'IN' }
      ],
      'salem': [
        { id: 'salem-city', name: 'Salem City', districtId: 'salem', stateCode: 'TN', countryCode: 'IN' }
      ],
      'delhi': [
        { id: 'new-delhi', name: 'New Delhi', districtId: 'delhi', stateCode: 'DL', countryCode: 'IN' },
        { id: 'delhi-city', name: 'Delhi City', districtId: 'delhi', stateCode: 'DL', countryCode: 'IN' }
      ],
      'gurgaon': [
        { id: 'gurgaon-city', name: 'Gurgaon', districtId: 'gurgaon', stateCode: 'HR', countryCode: 'IN' },
        { id: 'gurugram', name: 'Gurugram', districtId: 'gurgaon', stateCode: 'HR', countryCode: 'IN' }
      ]
    };
    
    const cities = citiesDatabase[normalizedDistrictId] || [];
    
    res.json({
      success: true,
      cities: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities'
    });
  }
}));

// @route   GET /api/locations/taluks/:cityId
// @desc    Get taluks by city
// @access  Public
router.get('/taluks/:cityId', asyncHandler(async (req, res) => {
  try {
    const { cityId } = req.params;
    
    // Normalize city ID
    const normalizedCityId = cityId.toLowerCase().replace(/\s+/g, '-');
    
    // Sample taluks data - would come from database in production
    const taluksDatabase = {
      'mumbai-city': [
        { id: 'mumbai-island-city', name: 'Mumbai Island City', cityId: 'mumbai-city', districtId: 'mumbai', stateCode: 'MH', countryCode: 'IN' }
      ],
      'mumbai-suburban': [
        { id: 'andheri', name: 'Andheri', cityId: 'mumbai-suburban', districtId: 'mumbai', stateCode: 'MH', countryCode: 'IN' },
        { id: 'borivali', name: 'Borivali', cityId: 'mumbai-suburban', districtId: 'mumbai', stateCode: 'MH', countryCode: 'IN' }
      ],
      'bangalore': [
        { id: 'bangalore-north', name: 'Bangalore North', cityId: 'bangalore', districtId: 'bangalore-urban', stateCode: 'KA', countryCode: 'IN' },
        { id: 'bangalore-south', name: 'Bangalore South', cityId: 'bangalore', districtId: 'bangalore-urban', stateCode: 'KA', countryCode: 'IN' }
      ],
      'tiruppur-city': [
        { id: 'tiruppur-taluk', name: 'Tiruppur Taluk', cityId: 'tiruppur-city', districtId: 'tiruppur', stateCode: 'TN', countryCode: 'IN' }
      ]
    };
    
    const taluks = taluksDatabase[normalizedCityId] || [];
    
    res.json({
      success: true,
      taluks: taluks
    });
  } catch (error) {
    console.error('Error fetching taluks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch taluks'
    });
  }
}));

// @route   GET /api/locations/location-names/:talukId
// @desc    Get location names by taluk
// @access  Public
router.get('/location-names/:talukId', asyncHandler(async (req, res) => {
  try {
    const { talukId } = req.params;
    
    // Normalize taluk ID
    const normalizedTalukId = talukId.toLowerCase().replace(/\s+/g, '-');
    
    res.json({
      success: true,
      locationNames: locationNamesDatabase[normalizedTalukId] || []
    });
  } catch (error) {
    console.error('Error fetching location names:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location names'
    });
  }
}));

// @route   GET /api/locations/pincode/:pincode
// @desc    Get location data by pincode
// @access  Public
router.get('/pincode/:pincode', asyncHandler(async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Validate pincode format (6 digits for India)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Expected 6 digits.'
      });
    }
    
    const locationData = pincodeDatabase[pincode];
    
    if (locationData) {
      res.json({
        success: true,
        data: locationData
      });
    } else {
      // If not found in our database, try external API
      try {
        const fetch = require('node-fetch');
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const locationData = {
            pincode: pincode,
            country: 'India',
            state: postOffice.State,
            city: postOffice.District,
            locality: postOffice.Name,
            area: postOffice.Block,
            district: postOffice.District
          };
          
          res.json({
            success: true,
            data: locationData
          });
        } else {
          res.status(404).json({
            success: false,
            message: 'Pincode not found'
          });
        }
      } catch (externalError) {
        console.error('External API error:', externalError);
        res.status(404).json({
          success: false,
          message: 'Pincode not found'
        });
      }
    }
  } catch (error) {
    console.error('Error fetching pincode data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pincode data'
    });
  }
}));

// @route   GET /api/locations/search/location-names
// @desc    Search location names by query and taluk
// @access  Public
router.get('/search/location-names', asyncHandler(async (req, res) => {
  try {
    const { q: query, talukId } = req.query;
    
    if (!query || !talukId) {
      return res.status(400).json({
        success: false,
        message: 'Query and talukId are required'
      });
    }
    
    // Normalize taluk ID
    const normalizedTalukId = talukId.toLowerCase().replace(/\s+/g, '-');
    const allLocationNames = locationNamesDatabase[normalizedTalukId] || [];
    
    // Filter location names based on query
    const filteredLocationNames = allLocationNames.filter(locationName =>
      locationName.name.toLowerCase().includes(query.toLowerCase()) ||
      locationName.type.toLowerCase().includes(query.toLowerCase()) ||
      (locationName.area && locationName.area.toLowerCase().includes(query.toLowerCase()))
    );
    
    res.json({
      success: true,
      locationNames: filteredLocationNames
    });
  } catch (error) {
    console.error('Error searching location names:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search location names'
    });
  }
}));

// @route   GET /api/locations/search
// @desc    Search locations across all levels with comprehensive coverage  
// @access  Public
router.get('/search', asyncHandler(async (req, res) => {
  try {
    const { q: query, state, level = 'location' } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = query.toLowerCase().trim();
    const results = [];

    // Search in all available data sources
    const allSources = [
      ...Object.values(locationNamesDatabase).flat(),
      ...Object.values(localitiesDatabase).flat()
    ];

    allSources.forEach(item => {
      if (item.name && item.name.toLowerCase().includes(searchQuery)) {
        // Don't add duplicates
        if (!results.find(r => r.id === item.id)) {
          results.push({
            ...item,
            type: level,
            relevance: item.name.toLowerCase() === searchQuery ? 1 : 0.5
          });
        }
      }
    });

    // Sort by relevance
    results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    res.json({
      success: true,
      results: results.slice(0, 20), // Limit to 20 results
      total: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
}));

// @route   GET /api/locations/coverage-stats  
// @desc    Get comprehensive coverage statistics
// @access  Public
router.get('/coverage-stats', asyncHandler(async (req, res) => {
  try {
    const { state } = req.query;
    
    let stats = {
      districts: 0,
      cities: 0,
      taluks: 0,
      locationNames: 0,
      coverage: 'comprehensive'
    };

    // Calculate actual data coverage
    const locationNamesCount = Object.values(locationNamesDatabase)
      .flat().length;
    const localitiesCount = Object.values(localitiesDatabase)
      .flat().length;
    
    stats.locationNames = locationNamesCount + localitiesCount;
    stats.taluks = Object.keys(locationNamesDatabase).length;
    stats.cities = new Set(
      Object.values(locationNamesDatabase)
        .flat()
        .map(item => item.cityId)
    ).size;
    stats.districts = new Set(
      Object.values(locationNamesDatabase)
        .flat()
        .map(item => item.districtId)
    ).size;

    // Determine coverage level
    if (stats.locationNames > 1000) {
      stats.coverage = 'comprehensive';
    } else if (stats.locationNames > 100) {
      stats.coverage = 'major-areas';
    } else {
      stats.coverage = 'limited';
    }

    res.json({
      success: true,
      stats: stats,
      message: `Coverage includes ${stats.locationNames} locations across ${stats.districts} districts`
    });

  } catch (error) {
    console.error('Coverage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get coverage statistics',
      error: error.message
    });
  }
}));

// @route   GET /api/locations/districts/:stateCode
// @desc    Get all districts for a state with comprehensive coverage
// @access  Public  
router.get('/districts/:stateCode', asyncHandler(async (req, res) => {
  try {
    const { stateCode } = req.params;
    const { country = 'IN' } = req.query;
    
    // For now, return a comprehensive list based on available data
    const districts = new Set();
    
    // Extract districts from our location data
    Object.values(locationNamesDatabase).flat().forEach(item => {
      if (item.districtId) {
        districts.add(item.districtId);
      }
    });

    // Convert to proper format
    const districtList = Array.from(districts).map(districtId => ({
      id: districtId,
      name: districtId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      stateCode: stateCode,
      countryCode: country
    }));

    res.json({
      success: true,
      districts: districtList,
      message: `Found ${districtList.length} districts for ${stateCode}`
    });

  } catch (error) {
    console.error('Districts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch districts',
      error: error.message
    });
  }
}));

module.exports = router;
