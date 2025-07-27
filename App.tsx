import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';

import MapView from './components/MapView';
import LocationService from './services/LocationService';
import PubService from './services/PubService';

interface Location {
  latitude: number;
  longitude: number;
}

interface Pub {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  type: string;
}

const App: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    initializeApp();
    
    return () => {
      LocationService.clearWatch();
    };
  }, []);

  const initializeApp = async (): Promise<void> => {
    try {
      setStatus('Getting your location...');
      setLoading(true);
      setError(null);

      // Get current location
      const currentLocation = await LocationService.getCurrentLocation();
      
      if (!currentLocation) {
        throw new Error('Unable to get location');
      }

      setLocation(currentLocation);
      setStatus('Finding nearby pubs...');

      // Find nearby pubs
      const nearbyPubs = await PubService.findNearbyPubs(
        currentLocation.latitude,
        currentLocation.longitude
      );

      setPubs(nearbyPubs);
      setStatus(`Found ${nearbyPubs.length} pubs nearby`);
      setLoading(false);

      // Start watching location for updates
      LocationService.watchLocation((newLocation: Location) => {
        setLocation(newLocation);
        // Optionally refresh pubs when location changes significantly
      });

    } catch (err) {
      console.error('App initialization error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLoading(false);
      setStatus('Error occurred');
    }
  };

  const handlePubSelect = (pub: Pub): void => {
    Alert.alert(
      pub.name,
      `Address: ${pub.address}\nType: ${pub.type}`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <Text style={styles.errorSubtext}>
        Please check your internet connection and location permissions.
      </Text>
    </View>
  );

  const renderMap = () => (
    <View style={styles.mapContainer}>
      <MapView
        location={location}
        pubs={pubs}
        onPubSelect={handlePubSelect}
      />
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>
          📍 {pubs.length} pubs found nearby
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#007AFF"
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍺 PubZ</Text>
        <Text style={styles.headerSubtitle}>Find pubs near you</Text>
      </View>

      {loading && renderLoading()}
      {error && !loading && renderError()}
      {!loading && !error && location && renderMap()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  statusBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statusBarText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default App;