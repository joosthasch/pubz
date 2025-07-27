import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';

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

interface MapViewProps {
  location: Location | null;
  pubs: Pub[];
  onPubSelect?: (pub: Pub) => void;
}

const MapView: React.FC<MapViewProps> = ({ location, pubs, onPubSelect }) => {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (location && webViewRef.current) {
      updateMapLocation(location);
    }
  }, [location]);

  useEffect(() => {
    if (pubs && pubs.length > 0 && webViewRef.current) {
      updatePubMarkers(pubs);
    }
  }, [pubs]);

  const updateMapLocation = (location: Location): void => {
    const script = `
      if (window.map) {
        window.map.setView([${location.latitude}, ${location.longitude}], 15);
        if (window.userMarker) {
          window.map.removeLayer(window.userMarker);
        }
        window.userMarker = L.marker([${location.latitude}, ${location.longitude}], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background: #4285f4; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(window.map);
      }
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const updatePubMarkers = (pubs: Pub[]): void => {
    const script = `
      if (window.map && window.pubMarkers) {
        // Clear existing pub markers
        window.pubMarkers.forEach(marker => window.map.removeLayer(marker));
        window.pubMarkers = [];
        
        // Add new pub markers
        const pubs = ${JSON.stringify(pubs)};
        pubs.forEach(pub => {
          const marker = L.marker([pub.latitude, pub.longitude], {
            icon: L.divIcon({
              className: 'pub-marker',
              html: '<div style="background: #8B4513; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍺</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          });
          
          marker.bindPopup(\`
            <div style="max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">\${pub.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">\${pub.address}</p>
              <p style="margin: 0; font-size: 12px; color: #888; text-transform: capitalize;">\${pub.type}</p>
            </div>
          \`);
          
          marker.on('click', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'pubSelected',
              pub: pub
            }));
          });
          
          marker.addTo(window.map);
          window.pubMarkers.push(marker);
        });
      }
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const handleMessage = (event: any): void => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'pubSelected' && onPubSelect) {
        onPubSelect(data.pub);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin=""/>
        <style>
            body {
                margin: 0;
                padding: 0;
            }
            #map {
                height: 100vh;
                width: 100vw;
            }
            .leaflet-popup-content-wrapper {
                border-radius: 8px;
            }
            .leaflet-popup-content {
                margin: 12px;
            }
            .user-location-marker, .pub-marker {
                border: none !important;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
        <script>
            // Initialize map
            window.map = L.map('map').setView([51.5074, -0.1278], 13);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(window.map);
            
            // Initialize markers arrays
            window.pubMarkers = [];
            window.userMarker = null;
            
            // Disable context menu
            window.map.getContainer().addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
            
            console.log('Map initialized successfully');
        </script>
    </body>
    </html>
  `;

  return (
    <WebView
      ref={webViewRef}
      source={{ html: htmlContent }}
      style={{ flex: 1 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      onMessage={handleMessage}
      onLoadEnd={() => {
        console.log('WebView loaded successfully');
        if (location) {
          updateMapLocation(location);
        }
      }}
      onError={(error) => {
        console.error('WebView error:', error);
      }}
    />
  );
};

export default MapView;