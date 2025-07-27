/**
 * @format
 */

describe('PubZ App', () => {
  it('should have proper package.json configuration', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.name).toBe('pubz');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('react-native');
    expect(packageJson.dependencies).toHaveProperty('react-native-webview');
    expect(packageJson.dependencies).toHaveProperty('react-native-geolocation-service');
    expect(packageJson.dependencies).toHaveProperty('react-native-permissions');
    expect(packageJson.dependencies).toHaveProperty('axios');
  });
});
