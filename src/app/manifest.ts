import type { MetadataRoute } from 'next';

import { CONFIG } from 'src/config-global';
import { dashboardPath } from 'src/routes/paths';
import { primary } from 'src/theme/core/palette';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: CONFIG.site.name,
    short_name: CONFIG.site.name,
    start_url: dashboardPath,
    scope: '/',
    display: 'standalone',
    theme_color: primary.main,
    icons: [
      { src: '/logo/notification-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo/notification-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
