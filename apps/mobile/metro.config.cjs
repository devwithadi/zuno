const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const sharedDirectory = path.resolve(__dirname, '../../packages/shared');

// Shared server/client TypeScript uses Node-compatible .js import specifiers.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const sharedImport = context.originModulePath.startsWith(`${sharedDirectory}${path.sep}`);
  const target = sharedImport && moduleName.startsWith('.') && moduleName.endsWith('.js')
    ? moduleName.slice(0, -3) : moduleName;
  return context.resolveRequest(context, target, platform);
};

module.exports = config;
