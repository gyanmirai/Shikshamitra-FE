import type { Plugin } from 'vite';

import { createRoomFixture } from './mock-state.js';

export function syntheticRoomServer(): Plugin {
  let fixture = createRoomFixture();
  return {
    name: 'synthetic-room-capacity-network',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = new URL(request.url!, 'http://127.0.0.1:4326').pathname;
        if (!path.startsWith('/api/') && !path.startsWith('/fixture/')) {
          next();
          return;
        }
        response.setHeader('Content-Type', 'application/json');
        if (path === '/fixture/reset') {
          fixture = createRoomFixture();
          response.end(JSON.stringify({ ok: true }));
          return;
        }
        let raw = '';
        request.on('data', (chunk) => {
          raw += chunk;
        });
        request.on('end', () => {
          const result = fixture.respond(request.method ?? 'GET', path, raw ? JSON.parse(raw) : {});
          response.statusCode = result.status;
          response.end(JSON.stringify(result.json));
        });
      });
    },
  };
}
