import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '../utils/permissions';

interface Location {
  latitude: number;
  longitude: number;
}

// Default location (London) if location services fail
const DEFAULT_LOCATION: Location = {
  latitude: 51.5074,
  longitude: -0.1278,
};

class LocationService {
  private watchId: number | null = null;
  private currentLocation: Location | null = null;

  async getCurrentLocation(): Promise<Location> {
    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        console.warn('Location permission denied, using default location');
        return DEFAULT_LOCATION;
      }

      return new Promise<Location>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            this.currentLocation = location;
            resolve(location);
          },
          (error) => {
            console.error('Location error:', error);
            // Return default location on error
            resolve(DEFAULT_LOCATION);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      return DEFAULT_LOCATION;
    }
  }

  async watchLocation(callback: (location: Location) => void): Promise<number | null> {
    return new Promise(async (resolve) => {
      try {
        const hasPermission = await requestLocationPermission();
        
        if (!hasPermission) {
          callback(DEFAULT_LOCATION);
          resolve(null);
          return;
        }

        this.watchId = Geolocation.watchPosition(
          (position) => {
            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            this.currentLocation = location;
            callback(location);
          },
          (error) => {
            console.error('Location watch error:', error);
            callback(DEFAULT_LOCATION);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000,
            distanceFilter: 10,
          }
        );
        
        resolve(this.watchId);
      } catch (error) {
        console.error('Error watching location:', error);
        callback(DEFAULT_LOCATION);
        resolve(null);
      }
    });
  }

  clearWatch(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getLastKnownLocation(): Location {
    return this.currentLocation || DEFAULT_LOCATION;
  }
}

export default new LocationService();