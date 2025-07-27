# PubZ - React Native Pub Finder

A React Native application that helps you find pubs near your current location using OpenStreetMap data and interactive maps.

## Features

🍺 **Pub Discovery**: Find pubs, bars, and breweries within 1km of your location  
📍 **Location Services**: GPS-based location detection with proper permission handling  
🗺️ **Interactive Map**: Leaflet-powered map with custom pub markers and popups  
🔄 **Real-time Data**: Live pub data from OpenStreetMap Overpass API  
📱 **Cross-platform**: Works on both iOS and Android  
⚡ **Offline Fallback**: Mock data when API is unavailable  

## Prerequisites

- Node.js (>=16)
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

## Installation

```bash
# Clone the repository
git clone https://github.com/joosthasch/pubz.git
cd pubz

# Install dependencies
npm install

# For iOS (additional step)
cd ios && pod install && cd ..
```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Start Metro Bundler
```bash
npm start
```

## Project Structure

```
pubz/
├── App.js                      # Main app component
├── index.js                    # App entry point
├── package.json               # Dependencies and scripts
├── components/
│   └── MapView.js             # WebView with Leaflet map
├── services/
│   ├── LocationService.js     # GPS location handling
│   └── PubService.js          # OpenStreetMap API integration
├── utils/
│   └── permissions.js         # Permission utilities
├── __tests__/
│   └── App-test.js           # Basic tests
└── README.md                  # This file
```

## Core Dependencies

- **React Native 0.72.6**: Core framework
- **react-native-webview**: For Leaflet map integration
- **react-native-geolocation-service**: GPS location services
- **react-native-permissions**: Permission handling
- **axios**: HTTP client for API requests

## How It Works

1. **Location Detection**: The app requests location permission and gets your current GPS coordinates
2. **Pub Discovery**: Queries OpenStreetMap Overpass API for nearby pubs within 1km radius
3. **Map Display**: Shows an interactive Leaflet map with:
   - Your current location (blue dot)
   - Pub markers (beer mug icons)
   - Clickable popups with pub information
4. **Fallback**: If API fails, shows mock pub data for testing

## API Integration

The app uses the OpenStreetMap Overpass API to find pubs:
- Searches for amenity=pub, amenity=bar, amenity=biergarten, and craft=brewery
- Queries within 1000m radius of user location
- Parses and displays pub name, address, and type

## Permissions

### iOS
- Location When In Use permission for finding nearby pubs

### Android
- ACCESS_FINE_LOCATION permission for GPS access

## Development Scripts

```bash
npm start          # Start Metro bundler
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm test          # Run tests
npm run lint      # Check code style
```

## Building for Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## Troubleshooting

### Common Issues

1. **Metro bundler not starting**: Clear cache with `npx react-native start --reset-cache`
2. **iOS build fails**: Run `cd ios && pod install && cd ..`
3. **Android build fails**: Clean project with `cd android && ./gradlew clean && cd ..`
4. **Location not working**: Check device permissions and GPS settings
5. **Map not loading**: Ensure internet connection for tiles and API

### Platform-Specific Setup

#### iOS
- Requires Xcode 12 or later
- iOS deployment target: 11.0 or later
- Add location permission description in Info.plist

#### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34
- Add location permissions in AndroidManifest.xml

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for pub data
- [Leaflet](https://leafletjs.com/) for interactive maps
- [React Native](https://reactnative.dev/) community for the awesome framework