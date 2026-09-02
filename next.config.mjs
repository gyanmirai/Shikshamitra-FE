const isStaticExport = 'false';
const disableTrailingSlashRedirects = process.env.E2E_DISABLE_TRAILING_SLASH === '1';

const nextConfig = {
  productionBrowserSourceMaps: false,

  // Local browser automation can resolve localhost through the loopback host.
  // Allow that development origin so Auth.js session requests and HMR are not
  // rejected by Next.js while testing the authenticated application locally.
  allowedDevOrigins: ['127.0.0.1'],

  trailingSlash: !disableTrailingSlashRedirects,
  skipTrailingSlashRedirect: true,
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

  distDir: process.env.NEXT_DIST_DIR || 'build',

  output: isStaticExport === 'true' ? 'export' : 'standalone',

  transpilePackages: ['mui-tel-input'],

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    workerThreads: false,
    viewTransition: true,
  },
};

export default nextConfig;
