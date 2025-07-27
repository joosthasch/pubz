module.exports = {
  dependencies: {
    'react-native-geolocation-service': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-geolocation-service/android',
          packageImportPath: 'import io.github.gautamjain.RNGeolocationPackage;',
        },
      },
    },
    'react-native-permissions': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-permissions/android',
          packageImportPath: 'import com.zoontek.rnpermissions.RNPermissionsPackage;',
        },
      },
    },
  },
};