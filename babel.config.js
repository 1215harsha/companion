module.exports = function(api) {
  // api.caller() handles its own caching — do NOT call api.cache() alongside it.
  // Skip the reanimated Babel plugin for web; it requires native-only react-native-worklets.
  const platform = api.caller((caller) => caller && caller.platform);

  return {
    presets: ['babel-preset-expo'],
    plugins: platform === 'web' ? [] : ['react-native-reanimated/plugin'],
  };
};
