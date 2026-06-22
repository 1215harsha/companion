module.exports = function(api) {
  api.cache(true);

  // react-native-reanimated/plugin requires react-native-worklets which is
  // native-only and not installed in Vercel's clean environment.
  // process.env.VERCEL is always set to '1' during Vercel builds.
  const plugins = [];
  if (!process.env.VERCEL) {
    plugins.push('react-native-reanimated/plugin');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
