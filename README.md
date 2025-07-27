# 🍺 Pubz - Pub Finder App

A React Native application that helps you find nearby pubs and bars using your device's GPS location and interactive maps powered by Leaflet and OpenStreetMap.

## Features

- 📍 **Real-time location tracking** - Uses device GPS to find your current location
- 🗺️ **Interactive maps** - Leaflet-powered maps with OpenStreetMap tiles in WebView
- 🍺 **Pub discovery** - Finds pubs and bars within 1km radius using OpenStreetMap data
- 📱 **Cross-platform** - Works on both iOS and Android
- 🎯 **Interactive markers** - Tap pub markers to see details like address, hours, and phone
- 🔄 **Live data** - Fetches real pub data from OpenStreetMap Overpass API
- 🛡️ **Permission handling** - Proper location permission management
- 💡 **Fallback data** - Shows sample pubs if API is unavailable

## Screenshots

The app displays an interactive map with:
- Blue marker for your current location
- Red markers for pubs
- Purple markers for bars
- 1km search radius visualization
- Tap markers to see pub details

## Technology Stack

- **React Native** 0.72.6
- **Leaflet** for interactive maps
- **OpenStreetMap** for map tiles and pub data
- **react-native-webview** for Leaflet integration
- **react-native-geolocation-service** for GPS location
- **react-native-permissions** for permission handling
- **axios** for API requests

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/joosthasch/pubz.git
   cd pubz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup**
   - Ensure Android SDK is installed
   - Configure environment variables (ANDROID_HOME)

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Development Server
```bash
npm start
```

## Project Structure

```
pubz/
├── components/
│   └── MapView.js          # Leaflet map component in WebView
├── services/
│   ├── LocationService.js   # GPS location handling
│   └── PubService.js       # OpenStreetMap API integration
├── utils/
│   └── permissions.js      # Location permission utilities
├── App.js                  # Main application component
├── index.js               # App entry point
├── package.json           # Dependencies and scripts
├── metro.config.js        # Metro bundler configuration
├── babel.config.js        # Babel configuration
└── app.json              # App metadata
```

## Permissions

### iOS (ios/Info.plist)
Add location permission descriptions:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to find nearby pubs.</string>
```

### Android (android/app/src/main/AndroidManifest.xml)
Add location permissions:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## API Integration

The app uses the **OpenStreetMap Overpass API** to fetch real pub data:
- Searches for amenity=pub and amenity=bar
- Within 1km radius of user location
- Falls back to mock data if API is unavailable
- No API key required

## Development

### Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Key Components

1. **App.js** - Main component handling state, location, and pub data
2. **MapView.js** - WebView-based Leaflet map with markers and interactions
3. **LocationService.js** - GPS location and permission handling
4. **PubService.js** - OpenStreetMap API integration and data processing

## Troubleshooting

### Location Issues
- Ensure location permissions are granted
- Check that GPS is enabled on device
- Test on physical device (emulator GPS may be unreliable)

### Map Loading Issues
- Check internet connection for map tiles
- Verify WebView is properly configured
- Check console for JavaScript errors

### API Issues
- App includes fallback mock data
- Check OpenStreetMap Overpass API status
- Verify network connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

MIT License - see LICENSE file for details