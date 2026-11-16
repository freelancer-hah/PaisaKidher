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

// 3. Custom resolver mapping
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Map async-storage to its compiled CommonJS file
  if (moduleName === '@react-native-async-storage/async-storage') {
    return context.resolveRequest(
      context,
      '@react-native-async-storage/async-storage/lib/commonjs/index.js',
      platform
    );
  }

  // Fallback for relative assets inside @react-navigation if needed
  if (
    (moduleName.endsWith('.png') || moduleName.endsWith('.jpg')) &&
    context.originModulePath &&
    context.originModulePath.includes('@react-navigation')
  ) {
    const dir = path.dirname(context.originModulePath);
    const target = path.resolve(dir, moduleName);
    return {
      type: 'sourceFile',
      filePath: target,
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
