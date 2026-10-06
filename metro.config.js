// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// The law database ships gzip-compressed and is inflated on first launch.
config.resolver.assetExts = [...config.resolver.assetExts.filter((e) => e !== 'db'), 'gz'];
module.exports = config;
