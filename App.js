import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView from './components/MapView';
import {LocationService} from './services/LocationService';
import {PubService} from './services/PubService';
import {
  requestLocationPermission,
  LocationPermissionStatus,
  openAppSettings,
} from './utils/permissions';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [pubs, setPubs] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [pubsLoaded, setPubsLoaded] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission and get current location
      const location = await LocationService.getCurrentPosition();
      setUserLocation(location);

      // Fetch nearby pubs
      const pubData = await PubService.fetchNearbyPubs(
        location.latitude,
        location.longitude
      );

      if (pubData.success) {
        setPubs(pubData.pubs);
        setPubsLoaded(true);
        
        if (pubData.isMockData) {
          Alert.alert(
            'Using Sample Data',
            'Unable to connect to OpenStreetMap. Showing sample pubs for demonstration.',
            [{text: 'OK'}]
          );
        }
      } else {
        throw new Error('Failed to load pub data');
      }

    } catch (err) {
      console.error('App initialization error:', err);
      setError(err.message);
      
      // Show appropriate error alert based on error type
      if (err.message.includes('permission')) {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to find nearby pubs. Please grant location permission in your device settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: openAppSettings},
          ]
        );
      } else {
        Alert.alert(
          'Error',
          err.message,
          [
            {text: 'Retry', onPress: initializeApp},
            {text: 'Cancel', style: 'cancel'},
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handleMarkerPress = (pub) => {
    Alert.alert(
      pub.name,
      `Type: ${pub.type}\\n${pub.address ? `Address: ${pub.address}\\n` : ''}${pub.phone ? `Phone: ${pub.phone}\\n` : ''}${pub.openingHours ? `Hours: ${pub.openingHours}\\n` : ''}${pub.description ? `\\n${pub.description}` : ''}`,
      [{text: 'OK'}]
    );
  };

  const handleRetry = () => {
    initializeApp();
  };

  const renderError = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>⚠️</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#e74c3c" />
      <Text style={styles.loadingText}>Finding nearby pubs...</Text>
      <Text style={styles.loadingSubtext}>
        {!userLocation ? 'Getting your location' : 'Loading pub data'}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (error) {
      return renderError();
    }

    if (loading || !userLocation) {
      return renderLoading();
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          userLocation={userLocation}
          pubs={pubs}
          onMapReady={handleMapReady}
          onMarkerPress={handleMarkerPress}
          style={styles.map}
        />
        
        {!mapReady && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.mapLoadingText}>Loading map...</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Found {pubs.length} pub{pubs.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#2c3e50"
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍺 Pubz</Text>
        <Text style={styles.headerSubtitle}>Find nearby pubs & bars</Text>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
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
    color: '#ecf0f1',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#2c3e50',
    marginTop: 20,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  mapLoadingText: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 10,
    fontWeight: '500',
  },
  statsContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statsText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
});

export default App;