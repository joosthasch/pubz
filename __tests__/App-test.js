/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

// Mock the modules that require native functionality
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
    ANDROID: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
  openSettings: jest.fn(),
}));

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({
    data: {
      elements: []
    }
  })),
}));

it('renders correctly', () => {
  renderer.create(<App />);
});