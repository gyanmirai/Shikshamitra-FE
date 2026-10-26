import type { Plugin } from 'vite';

import { createAcademicFormattingFixture } from './mock-state';

export function syntheticAcademicFormattingServer(): Plugin {
  let fixture = createAcademicFormattingFixture();
  return {
    name: 'synthetic-academic-field-formatting-network',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const route = new URL(request.url ?? '/', 'http://127.0.0.1:4336').pathname;
        if (!route.startsWith('/api/') && !route.startsWith('/fixture/')) {
          next();
          return;
        }
        response.setHeader('Content-Type', 'application/json');
        if (route === '/fixture/reset') {
          fixture = createAcademicFormattingFixture();
          response.end(JSON.stringify({ ok: true }));
          return;
        }
        let raw = '';
        request.on('data', (chunk) => {
          raw += chunk;
        });
        request.on('end', () => {
          const result = fixture.respond(
            request.method ?? 'GET',
            route,
            raw ? JSON.parse(raw) : {}
          );
          response.statusCode = result.status;
          response.end(JSON.stringify(result.json));
        });
      });
    },
  };
}
