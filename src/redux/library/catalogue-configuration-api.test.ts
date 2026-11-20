import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { catalogueSchool } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import { catalogueTestStore } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import { catalogueConfigurationApi } from './catalogue-configuration-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(clearCachedAuthSession);

it('reads the actual owning configuration route without an academic-year or category-settings lookup', async () => {
  const urls: string[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/catalogue/configuration', ({ request }) => {
      urls.push(request.url);
      return HttpResponse.json(catalogueSchool);
    })
  );
  const result = await catalogueTestStore().dispatch(
    catalogueConfigurationApi.endpoints.getCatalogueConfiguration.initiate()
  );
  expect(result).toMatchObject({ data: catalogueSchool });
  expect(urls).toEqual(['http://library.test/api/library/catalogue/configuration']);
});

it('submits the exact opaque expected revision and nested school definition through the shared API', async () => {
  const {
    revision,
    source: _source,
    canManageConfiguration: _capability,
    ...definition
  } = catalogueSchool;
  const command = { expectedRevision: ` ${revision} `, definition };
  let sent: unknown;
  mswServer.use(
    http.put('http://library.test/api/library/catalogue/configuration', async ({ request }) => {
      sent = await request.json();
      return HttpResponse.json({ ...catalogueSchool, revision: 'school-revision-2' });
    })
  );
  const result = await catalogueTestStore().dispatch(
    catalogueConfigurationApi.endpoints.updateCatalogueConfiguration.initiate(command)
  );
  expect(result).toMatchObject({ data: { revision: 'school-revision-2' } });
  expect(sent).toEqual(command);
});
