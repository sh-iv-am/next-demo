import type { NextConfig } from "next";
import path from "path";

const packageAliases = {
  '@juspay-tech/capacitor-react-hyperswitch': path.resolve(
    __dirname,
    'node_modules/@juspay-tech/capacitor-react-hyperswitch',
  ),
  '@juspay-tech/capacitor-hyperswitch': path.resolve(
    __dirname,
    'node_modules/@juspay-tech/capacitor-hyperswitch',
  ),
};

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: {
    compilationMode: 'annotation',
  },
  reactStrictMode: true,
  output: 'export',
  distDir: 'dist',
  webpack(config) {
    config.resolve.symlinks = true;
    config.resolve.alias = {
      ...config.resolve.alias,
      ...packageAliases,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    };
    return config;
  },
};

export default nextConfig;
