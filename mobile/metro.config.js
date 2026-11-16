const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Ensure Metro watches both project and workspace root
config.watchFolders = [projectRoot, workspaceRoot];

// 2. Explicitly point Metro to node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Custom resolver mapping for packages with unpublished 'src' files in npm release
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@react-native-async-storage/async-storage') {
    return context.resolveRequest(
      context,
      '@react-native-async-storage/async-storage/lib/commonjs/index.js',
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
