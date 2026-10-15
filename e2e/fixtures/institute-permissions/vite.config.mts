import fixture from '../permission-inheritance/vite.config.mts';

export default {
  ...fixture,
  cacheDir: `${fixture.cacheDir}-institute-permissions`,
  define: { 'process.env': JSON.stringify({
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4198', NEXT_PUBLIC_APP_URL: '', BUILD_STATIC_EXPORT: 'false',
  }) },
  server: { ...fixture.server, port: 4198 },
};
