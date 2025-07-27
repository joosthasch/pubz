import axios from 'axios';

// Mock data for fallback when API fails
const MOCK_PUBS = [
  {
    id: 'mock-1',
    name: 'The Red Lion',
    latitude: 51.5074,
    longitude: -0.1278,
    address: '123 High Street, London',
    type: 'pub',
  },
  {
    id: 'mock-2',
    name: 'The Crown & Anchor',
    latitude: 51.5080,
    longitude: -0.1270,
    address: '456 King\'s Road, London',
    type: 'pub',
  },
  {
    id: 'mock-3',
    name: 'The George Inn',
    latitude: 51.5068,
    longitude: -0.1285,
    address: '789 Queen Street, London',
    type: 'pub',
  },
];

class PubService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async findNearbyPubs(latitude, longitude, radiusKm = 1) {
    try {
      const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const pubs = await this.queryOverpassAPI(latitude, longitude, radiusKm);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: pubs,
        timestamp: Date.now(),
      });

      return pubs;
    } catch (error) {
      console.error('Error finding nearby pubs:', error);
      
      // Return mock data as fallback
      console.warn('Using mock pub data as fallback');
      return this.getMockPubsNearLocation(latitude, longitude);
    }
  }

  async queryOverpassAPI(latitude, longitude, radiusKm) {
    const radiusMeters = radiusKm * 1000;
    
    // Overpass API query for pubs, bars, and breweries
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pub"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="bar"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="biergarten"](around:${radiusMeters},${latitude},${longitude});
        node["craft"="brewery"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="pub"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="bar"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="biergarten"](around:${radiusMeters},${latitude},${longitude});
        way["craft"="brewery"](around:${radiusMeters},${latitude},${longitude});
      );
      out center meta;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
        timeout: 15000,
      }
    );

    return this.parseOverpassResponse(response.data);
  }

  parseOverpassResponse(data) {
    if (!data || !data.elements) {
      return [];
    }

    return data.elements
      .map(element => {
        const lat = element.lat || (element.center && element.center.lat);
        const lon = element.lon || (element.center && element.center.lon);
        
        if (!lat || !lon) {
          return null;
        }

        const tags = element.tags || {};
        const name = tags.name || tags['name:en'] || 'Unnamed Pub';
        const address = this.formatAddress(tags);
        const type = tags.amenity || tags.craft || 'pub';

        return {
          id: `osm-${element.type}-${element.id}`,
          name,
          latitude: lat,
          longitude: lon,
          address,
          type,
          tags,
        };
      })
      .filter(pub => pub !== null)
      .slice(0, 50); // Limit to 50 results
  }

  formatAddress(tags) {
    const parts = [];
    
    if (tags['addr:housenumber']) {
      parts.push(tags['addr:housenumber']);
    }
    if (tags['addr:street']) {
      parts.push(tags['addr:street']);
    }
    if (tags['addr:city']) {
      parts.push(tags['addr:city']);
    }
    if (tags['addr:postcode']) {
      parts.push(tags['addr:postcode']);
    }

    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }

  getMockPubsNearLocation(latitude, longitude) {
    // Generate mock pubs around the given location
    return MOCK_PUBS.map((pub, index) => ({
      ...pub,
      id: `mock-${index + 1}`,
      latitude: latitude + (Math.random() - 0.5) * 0.01, // Within ~500m
      longitude: longitude + (Math.random() - 0.5) * 0.01,
    }));
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new PubService();