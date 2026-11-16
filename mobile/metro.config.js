const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Ensure Metro watches the project root
config.watchFolders = [projectRoot, workspaceRoot];

// 2. Explicitly point Metro to the mobile node_modules directory
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Fallback resolver order
config.resolver.resolverMainFields = ['module', 'main', 'react-native'];

module.exports = config;
