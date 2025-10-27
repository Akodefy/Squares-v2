import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { locationService } from '@/services/locationService';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LocationTestPage = () => {
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Options for dropdowns
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [talukOptions, setTalukOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const [testResults, setTestResults] = useState({
    countries: { status: 'idle', count: 0, data: [] },
    states: { status: 'idle', count: 0, data: [] },
    districts: { status: 'idle', count: 0, data: [] },
    cities: { status: 'idle', count: 0, data: [] },
    taluks: { status: 'idle', count: 0, data: [] },
    locations: { status: 'idle', count: 0, data: [] }
  });

  const [manualTests, setManualTests] = useState({
    searchTest: '',
    searchResults: []
  });

  // Load data for dropdowns
  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) loadStates();
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) loadDistricts();
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict && selectedState) loadCities();
  }, [selectedDistrict, selectedState]);

  useEffect(() => {
    if (selectedCity) loadTaluks();
  }, [selectedCity]);

  useEffect(() => {
    if (selectedTaluk) loadLocations();
  }, [selectedTaluk]);

  const loadCountries = async () => {
    setTestResults(prev => ({ ...prev, countries: { ...prev.countries, status: 'loading' } }));
    try {
      const countries = await locationService.getCountries();
      setCountryOptions(countries);
      setTestResults(prev => ({ 
        ...prev, 
        countries: { status: 'success', count: countries.length, data: countries.slice(0, 5) }
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        countries: { status: 'error', count: 0, data: [], error: error.message }
      }));
    }
  };

  const loadStates = async () => {
    setTestResults(prev => ({ ...prev, states: { ...prev.states, status: 'loading' } }));
    try {
      const states = await locationService.getStatesByCountry(selectedCountry);
      setStateOptions(states);
      setTestResults(prev => ({ 
        ...prev, 
        states: { status: 'success', count: states.length, data: states.slice(0, 10) }
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        states: { status: 'error', count: 0, data: [], error: error.message }
      }));
    }
  };

  const loadDistricts = async () => {
    setTestResults(prev => ({ ...prev, districts: { ...prev.districts, status: 'loading' } }));
    try {
      const districts = await locationService.getDistrictsByState(selectedState);
      setDistrictOptions(districts);
      setTestResults(prev => ({ 
        ...prev, 
        districts: { status: 'success', count: districts.length, data: districts.slice(0, 10) }
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        districts: { status: 'error', count: 0, data: [], error: error.message }
      }));
    }
  };

  const loadCities = async () => {
    setTestResults(prev => ({ ...prev, cities: { ...prev.cities, status: 'loading' } }));
    try {
      const cities = await locationService.getCitiesByDistrict(selectedDistrict, selectedState);
      setCityOptions(cities);
      setTestResults(prev => ({ 
        ...prev, 
        cities: { status: 'success', count: cities.length, data: cities.slice(0, 10) }
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        cities: { status: 'error', count: 0, data: [], error: error.message }
      }));
    }
  };

  const loadTaluks = async () => {
    setTestResults(prev => ({ ...prev, taluks: { ...prev.taluks, status: 'loading' } }));
    try {
      const taluks = await locationService.getTaluksByCity(selectedCity);
      setTalukOptions(taluks);
      setTestResults(prev => ({ 
        ...prev, 
        taluks: { status: 'success', count: taluks.length, data: taluks.slice(0, 10) }
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        taluks: { status: 'error', count: 0, data: [], error: error.message }
      }));
    }
  };

  const loadLocations = async () => {
    setTestResults(prev => ({ ...prev, locations: { ...prev.locations, status: 'loading' } }));
    try {
      const locations = await locationService.getLocationNamesByTaluk(selectedTaluk);
      setLocationOptions(locations);
      setTestResults(prev => ({ 
        ...prev, 
        locations: { status: 'success', count: locations.length, data: locations.slice(0, 10) }
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        locations: { status: 'error', count: 0, data: [], error: error.message }
      }));
    }
  };

  // Test search functionality
  const testSearch = async (query) => {
    if (query.length < 2) return;
    
    try {
      const results = await locationService.searchLocations(query, selectedState);
      setManualTests(prev => ({ 
        ...prev, 
        searchResults: results.slice(0, 10) 
      }));
    } catch (error) {
      console.error('Search test error:', error);
      setManualTests(prev => ({ 
        ...prev, 
        searchResults: [] 
      }));
    }
  };

  const renderTestResult = (testName, result) => {
    const getStatusIcon = () => {
      switch (result.status) {
        case 'loading': return <Loader2 className="h-4 w-4 animate-spin" />;
        case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
      }
    };

    const getStatusColor = () => {
      switch (result.status) {
        case 'success': return 'bg-green-50 border-green-200';
        case 'error': return 'bg-red-50 border-red-200';
        case 'loading': return 'bg-blue-50 border-blue-200';
        default: return 'bg-gray-50 border-gray-200';
      }
    };

    return (
      <Card className={`${getStatusColor()}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {getStatusIcon()}
            {testName}
            <Badge variant="outline">{result.count} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {result.status === 'error' && (
            <p className="text-red-600 text-xs">{result.error}</p>
          )}
          {result.data.length > 0 && (
            <div className="text-xs space-y-1">
              {result.data.map((item, index) => (
                <div key={index} className="truncate">
                  {item.name} {item.id && `(${item.id})`}
                </div>
              ))}
              {result.count > result.data.length && (
                <div className="text-gray-500">...and {result.count - result.data.length} more</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

    const runAPITests = async () => {
        // Reset all selections except country
        setSelectedState('');
        setSelectedDistrict('');
        setSelectedCity('');
        setSelectedTaluk('');
        setSelectedLocation('');
        
        // Reload all data from the beginning
        await loadCountries();
        
        // If a country is selected, reload its states
        if (selectedCountry) {
            await loadStates();
        }
    };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Location Service Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Test the location dropdowns and API endpoints
        </p>
      </div>

      {/* Manual Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Manual Location Selection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Country *</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>State/Province *</Label>
              <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>District *</Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districtOptions.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>City *</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Taluk/Block *</Label>
              <Select value={selectedTaluk} onValueChange={setSelectedTaluk} disabled={!selectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select taluk" />
                </SelectTrigger>
                <SelectContent>
                  {talukOptions.map((taluk) => (
                    <SelectItem key={taluk.id} value={taluk.id}>
                      {taluk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location Name *</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation} disabled={!selectedTaluk}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Selected Values:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Country: <Badge variant="outline">{selectedCountry || 'None'}</Badge></div>
              <div>State: <Badge variant="outline">{selectedState || 'None'}</Badge></div>
              <div>District: <Badge variant="outline">{selectedDistrict || 'None'}</Badge></div>
              <div>City: <Badge variant="outline">{selectedCity || 'None'}</Badge></div>
              <div>Taluk: <Badge variant="outline">{selectedTaluk || 'None'}</Badge></div>
              <div>Location: <Badge variant="outline">{selectedLocation || 'None'}</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>📊 API Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderTestResult('Countries', testResults.countries)}
            {renderTestResult('States', testResults.states)}
            {renderTestResult('Districts', testResults.districts)}
            {renderTestResult('Cities', testResults.cities)}
            {renderTestResult('Taluks', testResults.taluks)}
            {renderTestResult('Location Names', testResults.locations)}
          </div>
        </CardContent>
      </Card>

      {/* Search Test */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Search Functionality Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type to search locations (e.g., 'tir', 'tiruppur', 'chen')"
              value={manualTests.searchTest}
              onChange={(e) => {
                setManualTests(prev => ({ ...prev, searchTest: e.target.value }));
                testSearch(e.target.value);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <Button 
              onClick={() => testSearch(manualTests.searchTest)}
              disabled={manualTests.searchTest.length < 2}
            >
              Search
            </Button>
          </div>

          {manualTests.searchResults.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Search Results ({manualTests.searchResults.length}):</h4>
              <div className="space-y-1 text-sm">
                {manualTests.searchResults.map((result, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{result.name}</span>
                    <Badge variant="outline">{result.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => {
                setSelectedCountry('IN');
                setSelectedState('TN');
                setSelectedDistrict('tiruppur');
              }}
              variant="outline"
            >
              Test Tiruppur District
            </Button>
            
            <Button 
              onClick={() => {
                setSelectedCountry('IN');
                setSelectedState('KA');
                setSelectedDistrict('bangalore-urban');
              }}
              variant="outline"
            >
              Test Bangalore District
            </Button>
            
            <Button 
              onClick={() => {
                setSelectedCountry('IN');
                setSelectedState('MH');
                setSelectedDistrict('mumbai');
              }}
              variant="outline"
            >
              Test Mumbai District
            </Button>

            <Button 
              onClick={() => {
                setManualTests(prev => ({ ...prev, searchTest: 'tiruppur' }));
                testSearch('tiruppur');
              }}
              variant="outline"
            >
              Search "tiruppur"
            </Button>

            <Button 
              onClick={runAPITests}
              variant="default"
            >
              Refresh All Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>1. Check Districts:</strong> Select "Tamil Nadu" state and verify you see many districts (not just Mumbai, Bangalore, Tiruppur)</div>
          <div><strong>2. Check Cities:</strong> Select "Tiruppur" district and verify you see multiple cities in that district</div>
          <div><strong>3. Check Taluks:</strong> Select a city and verify you see multiple taluks (North, South, East, West, etc.)</div>
          <div><strong>4. Check Search:</strong> Type "tir" or "tiruppur" and verify search returns results</div>
          <div><strong>5. Check Multi-letter Search:</strong> Type more than one letter and verify it still works</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationTestPage;