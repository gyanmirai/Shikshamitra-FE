import '@testing-library/jest-dom/vitest';
import { mswServer } from 'src/test/mswServer';
import { cleanup } from '@testing-library/react';
import { _api as iconifyApi } from '@iconify/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Iconify captures fetch during import, before MSW starts. Keep its default
// transport offline so component tests cannot leave external TLS requests alive.
// Tests of icon loading can still install their own transport with setFetch.
iconifyApi.setFetch(async (resource) => {
  const url = new URL(resource instanceof Request ? resource.url : resource);
  return new Response(
    JSON.stringify({
      prefix:
        url.pathname
          .split('/')
          .at(-1)
          ?.replace(/\.json$/, '') ?? '',
      icons: {},
      not_found: url.searchParams.get('icons')?.split(',') ?? [],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  mswServer.resetHandlers();
  cleanup();
});

afterAll(() => {
  mswServer.close();
});
