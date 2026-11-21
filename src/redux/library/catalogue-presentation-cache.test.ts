import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { catalogueDefaults } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import { catalogueTestStore } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import { booksApi } from './bookList/bookList-api';
import { catalogueConfigurationApi } from './catalogue-configuration-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(clearCachedAuthSession);

it('refreshes a subscribed catalogue detail when configuration changes its current display label', async () => {
  let label = 'Original Gujarati label';
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id', () =>
      HttpResponse.json({
        id: 'book-id',
        title: 'Stories',
        author: 'Asha',
        language: 0,
        languageCode: 'gu',
        languageLabel: label,
        copies: [],
      })
    ),
    http.put('http://library.test/api/library/catalogue/configuration', () => {
      label = 'Reviewed Gujarati label';
      return HttpResponse.json({ ...catalogueDefaults, revision: 'school-2', source: 'School' });
    })
  );
  const store = catalogueTestStore();
  const subscription = store.dispatch(
    booksApi.endpoints.getBookById.initiate({ bookId: 'book-id' })
  );
  try {
    expect((await subscription.unwrap()).languageLabel).toBe('Original Gujarati label');
    await store
      .dispatch(
        catalogueConfigurationApi.endpoints.updateCatalogueConfiguration.initiate({
          expectedRevision: 'defaults-v1',
          definition: {
            requiredFields: catalogueDefaults.requiredFields,
            languages: catalogueDefaults.languages.map((item) =>
              item.code === 'gu' ? { ...item, label: 'Reviewed Gujarati label' } : item
            ),
            materials: [],
          },
        })
      )
      .unwrap();
    await waitFor(() =>
      expect(
        booksApi.endpoints.getBookById.select({ bookId: 'book-id' })(store.getState()).data
          ?.languageLabel
      ).toBe('Reviewed Gujarati label')
    );
  } finally {
    subscription.unsubscribe();
  }
});
