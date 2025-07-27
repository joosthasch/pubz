import Geolocation from 'react-native-geolocation-service';
import {
  requestLocationPermission,
  checkLocationPermission,
  LocationPermissionStatus,
} from '../utils/permissions';

export class LocationService {
  static watchId = null;

  /**
   * Get current position with permission handling
   */
  static async getCurrentPosition() {
    try {
      // Check if permission is already granted
      const permissionStatus = await checkLocationPermission();
      
      if (permissionStatus !== LocationPermissionStatus.GRANTED) {
        const permissionRequest = await requestLocationPermission();
        
        if (permissionRequest.status !== LocationPermissionStatus.GRANTED) {
          throw new Error(permissionRequest.message);
        }
      }

      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const {latitude, longitude} = position.coords;
            resolve({
              latitude,
              longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            
            let errorMessage = 'Unable to get current location';
            
            switch (error.code) {
              case 1:
                errorMessage = 'Location permission denied';
                break;
              case 2:
                errorMessage = 'Location unavailable';
                break;
              case 3:
                errorMessage = 'Location request timeout';
                break;
              default:
                errorMessage = `Location error: ${error.message}`;
            }
            
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      });
    } catch (error) {
      console.error('LocationService getCurrentPosition error:', error);
      throw error;
    }
  }

  /**
   * Watch position changes
   */
  static watchPosition(successCallback, errorCallback) {
    this.clearWatch();

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        successCallback({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.error('Watch position error:', error);
        errorCallback(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
        distanceFilter: 10, // Minimum distance (in meters) to trigger update
      }
    );

    return this.watchId;
  }

  /**
   * Clear position watching
   */
  static clearWatch() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  static degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}