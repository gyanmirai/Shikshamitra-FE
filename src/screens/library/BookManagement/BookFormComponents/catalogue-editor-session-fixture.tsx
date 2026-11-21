import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import {
  catalogueBook,
  catalogueSchool,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';

export const editorOptions = (catalogueConfiguration: CatalogueConfiguration) => ({
  bookCategories: [{ id: 'category-id', name: 'Fiction' }],
  sections: [
    {
      id: 'section-id',
      sectionName: 'Reading Room',
      shelfDetails: [{ id: 'shelf-id', shelfName: 'Shelf A' }],
    },
  ],
  catalogueConfiguration,
});

export const editorSessionValues = () => {
  const initial = catalogueBook();
  return {
    ...initial,
    expectedCatalogueConfigurationRevision: undefined,
    copies: initial.copies.map((copy) => ({ ...copy, section: 'section-id', shelf: 'shelf-id' })),
  };
};

export function serveSavedCatalogueBook(onCreate: (body: Record<string, unknown>) => void) {
  mswServer.use(
    http.post('http://library.test/api/library/books', async ({ request }) => {
      onCreate((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({
        id: 'saved-book',
        metadataRevision: 'metadata-saved',
        copiesRevision: 'copies-saved',
      });
    }),
    http.get('http://library.test/api/library/books/saved-book', () =>
      HttpResponse.json({
        ...editorSessionValues(),
        id: 'saved-book',
        metadataRevision: 'metadata-saved',
        copiesRevision: 'copies-saved',
        price: 125.25,
        priceText: '125.25',
        languageCode: 'en',
        catalogueConfiguration: catalogueSchool,
        copies: [
          {
            copyId: 'saved-copy',
            copyNumber: 1,
            accessionNumber: 'SCHOOL/SAVED',
            sectionId: 'section-id',
            shelfId: 'shelf-id',
            status: 0,
            canRemove: true,
          },
        ],
      })
    ),
    http.get('https://openlibrary.org/search.json', () => HttpResponse.json({ docs: [] }))
  );
}
