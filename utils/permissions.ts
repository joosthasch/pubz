import {Platform, Alert} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
  Permission,
} from 'react-native-permissions';

const LOCATION_PERMISSIONS: Record<string, Permission> = {
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
};

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const permission = LOCATION_PERMISSIONS[Platform.OS];
    
    if (!permission) {
      throw new Error('Platform not supported');
    }

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) {
      return true;
    }
    
    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }
    
    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location permission in settings to find nearby pubs.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings },
        ]
      );
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const permission = LOCATION_PERMISSIONS[Platform.OS];
    
    if (!permission) {
      return false;
    }

    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};