import axios from 'axios';

export class PubService {
  static readonly OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
  static readonly SEARCH_RADIUS = 1000; // 1km in meters

  /**
   * Fetch pubs near the given coordinates using OpenStreetMap Overpass API
   */
  static async fetchNearbyPubs(latitude, longitude, radius = PubService.SEARCH_RADIUS) {
    try {
      // Overpass QL query to find pubs within the radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          nwr["amenity"="pub"](around:${radius},${latitude},${longitude});
          nwr["amenity"="bar"](around:${radius},${latitude},${longitude});
        );
        out center meta;
      `;

      const response = await axios.post(
        PubService.OVERPASS_API_URL,
        overpassQuery,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data && response.data.elements) {
        const pubs = response.data.elements.map(element => {
          const lat = element.lat || (element.center && element.center.lat);
          const lon = element.lon || (element.center && element.center.lon);
          
          return {
            id: element.id,
            name: element.tags?.name || 'Unnamed Pub',
            type: element.tags?.amenity || 'pub',
            latitude: lat,
            longitude: lon,
            address: PubService.formatAddress(element.tags),
            phone: element.tags?.phone || null,
            website: element.tags?.website || null,
            openingHours: element.tags?.opening_hours || null,
            cuisine: element.tags?.cuisine || null,
            description: element.tags?.description || null,
            tags: element.tags || {},
          };
        }).filter(pub => pub.latitude && pub.longitude); // Filter out pubs without coordinates

        return {
          success: true,
          pubs,
          count: pubs.length,
        };
      } else {
        throw new Error('No data received from OpenStreetMap API');
      }
    } catch (error) {
      console.error('Error fetching pubs from OpenStreetMap:', error);
      
      // Return mock data as fallback
      return PubService.getMockPubs(latitude, longitude);
    }
  }

  /**
   * Format address from OpenStreetMap tags
   */
  static formatAddress(tags) {
    if (!tags) return null;

    const addressParts = [];
    
    if (tags['addr:housenumber']) {
      addressParts.push(tags['addr:housenumber']);
    }
    if (tags['addr:street']) {
      addressParts.push(tags['addr:street']);
    }
    if (tags['addr:city']) {
      addressParts.push(tags['addr:city']);
    }
    if (tags['addr:postcode']) {
      addressParts.push(tags['addr:postcode']);
    }

    return addressParts.length > 0 ? addressParts.join(', ') : null;
  }

  /**
   * Get mock pub data as fallback when API fails
   */
  static getMockPubs(centerLat, centerLon) {
    const mockPubs = [
      {
        id: 'mock-1',
        name: 'The Crown & Anchor',
        type: 'pub',
        latitude: centerLat + 0.002,
        longitude: centerLon + 0.001,
        address: '123 High Street, City Center',
        phone: '+44 1234 567890',
        website: null,
        openingHours: 'Mo-Su 11:00-23:00',
        cuisine: 'british',
        description: 'Traditional British pub with local ales',
        tags: { amenity: 'pub', name: 'The Crown & Anchor' },
      },
      {
        id: 'mock-2',
        name: 'Red Lion',
        type: 'pub',
        latitude: centerLat - 0.001,
        longitude: centerLon + 0.003,
        address: '456 Market Square',
        phone: null,
        website: 'https://redlionpub.example.com',
        openingHours: 'Mo-Su 12:00-24:00',
        cuisine: null,
        description: 'Historic pub dating back to 1650',
        tags: { amenity: 'pub', name: 'Red Lion' },
      },
      {
        id: 'mock-3',
        name: 'The Spotted Dog',
        type: 'pub',
        latitude: centerLat + 0.001,
        longitude: centerLon - 0.002,
        address: '789 Church Lane',
        phone: '+44 1234 567891',
        website: null,
        openingHours: 'Tu-Su 16:00-23:00',
        cuisine: 'gastropub',
        description: 'Gastropub with craft beers and artisan food',
        tags: { amenity: 'pub', name: 'The Spotted Dog' },
      },
      {
        id: 'mock-4',
        name: 'Cocktail Corner',
        type: 'bar',
        latitude: centerLat - 0.002,
        longitude: centerLon - 0.001,
        address: '321 Nightlife District',
        phone: '+44 1234 567892',
        website: 'https://cocktailcorner.example.com',
        openingHours: 'We-Sa 18:00-02:00',
        cuisine: null,
        description: 'Modern cocktail bar with live music',
        tags: { amenity: 'bar', name: 'Cocktail Corner' },
      },
    ];

    console.log('Using mock pub data as fallback');
    
    return {
      success: true,
      pubs: mockPubs,
      count: mockPubs.length,
      isMockData: true,
    };
  }

  /**
   * Search pubs by name or type
   */
  static searchPubs(pubs, searchTerm) {
    if (!searchTerm || !pubs) return pubs;

    const term = searchTerm.toLowerCase();
    
    return pubs.filter(pub => 
      pub.name.toLowerCase().includes(term) ||
      pub.type.toLowerCase().includes(term) ||
      (pub.cuisine && pub.cuisine.toLowerCase().includes(term)) ||
      (pub.address && pub.address.toLowerCase().includes(term))
    );
  }
}