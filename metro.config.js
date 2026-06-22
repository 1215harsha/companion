const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// On web, react-native-worklets is native-only and not available.
// Redirect all imports of it to a JS stub so the web bundle succeeds.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-worklets') {
    return {
      filePath: path.resolve(__dirname, 'src/mocks/react-native-worklets-mock.js'),
      type: 'sourceFile',
    };
  }
  // Fall through to default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
