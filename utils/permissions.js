import {Platform} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
} from 'react-native-permissions';

export const LocationPermissionStatus = {
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
};

/**
 * Request location permission based on platform
 */
export const requestLocationPermission = async () => {
  try {
    let permission;
    
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }

    const result = await request(permission);
    
    switch (result) {
      case RESULTS.UNAVAILABLE:
        return {
          status: LocationPermissionStatus.UNAVAILABLE,
          message: 'Location services are not available on this device',
        };
      case RESULTS.DENIED:
        return {
          status: LocationPermissionStatus.DENIED,
          message: 'Location permission was denied',
        };
      case RESULTS.GRANTED:
        return {
          status: LocationPermissionStatus.GRANTED,
          message: 'Location permission granted',
        };
      case RESULTS.BLOCKED:
        return {
          status: LocationPermissionStatus.BLOCKED,
          message: 'Location permission is blocked. Please enable it in settings',
        };
      default:
        return {
          status: LocationPermissionStatus.DENIED,
          message: 'Unknown permission status',
        };
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return {
      status: LocationPermissionStatus.DENIED,
      message: 'Error requesting location permission',
    };
  }
};

/**
 * Check current location permission status
 */
export const checkLocationPermission = async () => {
  try {
    let permission;
    
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }

    const result = await check(permission);
    
    switch (result) {
      case RESULTS.UNAVAILABLE:
        return LocationPermissionStatus.UNAVAILABLE;
      case RESULTS.DENIED:
        return LocationPermissionStatus.DENIED;
      case RESULTS.GRANTED:
        return LocationPermissionStatus.GRANTED;
      case RESULTS.BLOCKED:
        return LocationPermissionStatus.BLOCKED;
      default:
        return LocationPermissionStatus.DENIED;
    }
  } catch (error) {
    console.error('Error checking location permission:', error);
    return LocationPermissionStatus.DENIED;
  }
};

/**
 * Open device settings for the app
 */
export const openAppSettings = () => {
  openSettings();
};