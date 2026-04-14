const isStaticExport = 'false';

const nextConfig = {
  productionBrowserSourceMaps: false, // ✅ IMPORTANT (memory fix)

  trailingSlash: true,
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

  // ❌ REMOVE webpack (huge improvement)
  // webpack(config) {
  //   config.module.rules.push({
  //     test: /\.svg$/,
  //     use: ['@svgr/webpack'],
  //   });
  //   return config;
  // },

  ...(isStaticExport === 'true' && {
    output: 'export',
  }),

  reactStrictMode: false,

  distDir: 'build',
  output: 'standalone',

  transpilePackages: ['mui-tel-input'],

  // ✅ Add these
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    workerThreads: false,
  },
};

export default nextConfig;
