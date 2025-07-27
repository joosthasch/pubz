import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {WebView} from 'react-native-webview';

const {width, height} = Dimensions.get('window');

const MapView = ({
  userLocation,
  pubs = [],
  onMapReady,
  onMarkerPress,
  style,
}) => {
  const webViewRef = useRef(null);

  const generateMapHTML = () => {
    const pubMarkers = pubs
      .map(
        pub => `
        {
          id: '${pub.id}',
          name: '${pub.name.replace(/'/g, "\\'")}',
          type: '${pub.type}',
          lat: ${pub.latitude},
          lng: ${pub.longitude},
          address: '${(pub.address || '').replace(/'/g, "\\'")}',
          phone: '${pub.phone || ''}',
          website: '${pub.website || ''}',
          openingHours: '${(pub.openingHours || '').replace(/'/g, "\\'")}',
          cuisine: '${pub.cuisine || ''}',
          description: '${(pub.description || '').replace(/'/g, "\\'")}'
        }`
      )
      .join(',');

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Pub Map</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
              body { margin: 0; padding: 0; }
              #map { height: 100vh; width: 100vw; }
              .pub-popup { max-width: 200px; }
              .pub-popup h3 { margin: 0 0 5px 0; color: #2c3e50; }
              .pub-popup p { margin: 2px 0; font-size: 12px; color: #666; }
              .pub-popup .address { font-weight: bold; color: #34495e; }
              .pub-popup .hours { color: #27ae60; }
              .pub-popup .phone { color: #3498db; }
              .search-radius { stroke: #e74c3c; stroke-width: 2; fill: #e74c3c; fill-opacity: 0.1; }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
              // Initialize map
              const map = L.map('map').setView([${userLocation?.latitude || 51.505}, ${userLocation?.longitude || -0.09}], 15);
              
              // Add OpenStreetMap tiles
              L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                  maxZoom: 19
              }).addTo(map);

              // User location marker
              ${userLocation ? `
              const userIcon = L.divIcon({
                  className: 'user-location-marker',
                  html: '<div style="background: #3498db; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(52, 152, 219, 0.8);"></div>',
                  iconSize: [18, 18],
                  iconAnchor: [9, 9]
              });
              
              L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
                  .addTo(map)
                  .bindPopup('<b>Your Location</b>');

              // Add search radius circle
              L.circle([${userLocation.latitude}, ${userLocation.longitude}], {
                  radius: 1000,
                  className: 'search-radius'
              }).addTo(map);
              ` : ''}

              // Pub markers
              const pubs = [${pubMarkers}];
              
              const pubIcon = L.divIcon({
                  className: 'pub-marker',
                  html: '<div style="background: #e74c3c; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
              });

              const barIcon = L.divIcon({
                  className: 'bar-marker',
                  html: '<div style="background: #9b59b6; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
              });

              pubs.forEach(pub => {
                  const icon = pub.type === 'bar' ? barIcon : pubIcon;
                  
                  let popupContent = '<div class="pub-popup">';
                  popupContent += '<h3>' + pub.name + '</h3>';
                  
                  if (pub.address) {
                      popupContent += '<p class="address">📍 ' + pub.address + '</p>';
                  }
                  
                  if (pub.openingHours) {
                      popupContent += '<p class="hours">🕐 ' + pub.openingHours + '</p>';
                  }
                  
                  if (pub.phone) {
                      popupContent += '<p class="phone">📞 ' + pub.phone + '</p>';
                  }
                  
                  if (pub.cuisine) {
                      popupContent += '<p>🍽️ ' + pub.cuisine + '</p>';
                  }
                  
                  if (pub.description) {
                      popupContent += '<p><em>' + pub.description + '</em></p>';
                  }
                  
                  popupContent += '</div>';

                  const marker = L.marker([pub.lat, pub.lng], {icon: icon})
                      .addTo(map)
                      .bindPopup(popupContent);
                      
                  marker.on('click', function(e) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'markerPress',
                          pub: pub
                      }));
                  });
              });

              // Fit map to show all markers
              if (pubs.length > 0) {
                  const group = new L.featureGroup();
                  
                  ${userLocation ? `
                  group.addLayer(L.marker([${userLocation.latitude}, ${userLocation.longitude}]));
                  ` : ''}
                  
                  pubs.forEach(pub => {
                      group.addLayer(L.marker([pub.lat, pub.lng]));
                  });
                  
                  map.fitBounds(group.getBounds().pad(0.1));
              }

              // Notify React Native that map is ready
              setTimeout(() => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'mapReady'
                  }));
              }, 1000);

              // Handle map events
              map.on('moveend', function(e) {
                  const center = map.getCenter();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'mapMove',
                      center: {
                          latitude: center.lat,
                          longitude: center.lng
                      },
                      zoom: map.getZoom()
                  }));
              });
          </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'mapReady':
          onMapReady && onMapReady();
          break;
        case 'markerPress':
          onMarkerPress && onMarkerPress(data.pub);
          break;
        case 'mapMove':
          // Handle map movement if needed
          break;
        default:
          console.log('Unknown map message:', data);
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{html: generateMapHTML()}}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onError={(syntheticEvent) => {
          const {nativeEvent} = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const {nativeEvent} = syntheticEvent;
          console.error('WebView HTTP error: ', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default MapView;