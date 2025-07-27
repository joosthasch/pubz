import axios from 'axios';

interface Pub {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  type: string;
  tags?: any;
}

interface CacheEntry {
  data: Pub[];
  timestamp: number;
}

// Mock data for fallback when API fails
const MOCK_PUBS: Omit<Pub, 'id'>[] = [
  {
    name: 'The Red Lion',
    latitude: 51.5074,
    longitude: -0.1278,
    address: '123 High Street, London',
    type: 'pub',
  },
  {
    name: 'The Crown & Anchor',
    latitude: 51.5080,
    longitude: -0.1270,
    address: '456 King\'s Road, London',
    type: 'pub',
  },
  {
    name: 'The George Inn',
    latitude: 51.5068,
    longitude: -0.1285,
    address: '789 Queen Street, London',
    type: 'pub',
  },
];

class PubService {
  private cache = new Map<string, CacheEntry>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async findNearbyPubs(latitude: number, longitude: number, radiusKm: number = 1): Promise<Pub[]> {
    try {
      const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
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

  private async queryOverpassAPI(latitude: number, longitude: number, radiusKm: number): Promise<Pub[]> {
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

  private parseOverpassResponse(data: any): Pub[] {
    if (!data || !data.elements) {
      return [];
    }

    return data.elements
      .map((element: any): Pub | null => {
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
      .filter((pub: Pub | null): pub is Pub => pub !== null)
      .slice(0, 50); // Limit to 50 results
  }

  private formatAddress(tags: any): string {
    const parts: string[] = [];
    
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

  private getMockPubsNearLocation(latitude: number, longitude: number): Pub[] {
    // Generate mock pubs around the given location
    return MOCK_PUBS.map((pub, index) => ({
      ...pub,
      id: `mock-${index + 1}`,
      latitude: latitude + (Math.random() - 0.5) * 0.01, // Within ~500m
      longitude: longitude + (Math.random() - 0.5) * 0.01,
    }));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default new PubService();