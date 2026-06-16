const isStaticExport = 'false';
const disableTrailingSlashRedirects = process.env.E2E_DISABLE_TRAILING_SLASH === '1';

const nextConfig = {
  productionBrowserSourceMaps: false,

  trailingSlash: !disableTrailingSlashRedirects,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,

  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
  },

  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },

  reactStrictMode: false,

  distDir: 'build',

  output: isStaticExport === 'true' ? 'export' : 'standalone',

  transpilePackages: ['mui-tel-input'],

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    workerThreads: false,
  },
};

export default nextConfig;
