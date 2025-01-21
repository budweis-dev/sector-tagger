import { configureApi, fetchSectors, type ApiConfig } from '../../src/stores/sectors';

// Configure your API
const config: ApiConfig = {
  endpoint: 'https://your-api.com/sectors',
  // Optional: Transform API response to match Sector interface
  transformResponse: (data) => {
    return data.map((item: any) => ({
      id: item.id,
      name: item.title, // example: if your API uses 'title' instead of 'name'
      x: item.position.x,
      y: item.position.y,
      width: item.dimensions.width,
      height: item.dimensions.height,
      level: item.type
    }));
  },
  // Optional: Add custom headers
  headers: {
    'Authorization': 'Bearer your-token'
  }
};

// Set up the API configuration
configureApi(config);

// Fetch sectors from your API
await fetchSectors();