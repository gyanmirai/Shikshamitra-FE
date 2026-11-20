import { it, expect } from 'vitest';
import {
  catalogueBook,
  catalogueDefaults,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';

import { createCatalogueBookSchemas } from './catalogue-book-schema';

const saved = {
  languageCode: 'en',
  bookId: '7a1959fa-2e3b-401a-bf57-3c43fcbebbd0',
  price: '-1.25',
};

it('allows only the exact opened historic negative price in both metadata and final validation', async () => {
  const schemas = createCatalogueBookSchemas(catalogueDefaults, saved);
  const values = { ...catalogueBook(), id: saved.bookId, price: saved.price };
  await expect(schemas[0].validateAt('price', values)).resolves.toBe('-1.25');
  await expect(schemas[2].validateAt('price', values)).resolves.toBe('-1.25');
});

it('rejects a changed negative price even when the opened title had a historic negative', async () => {
  const schemas = createCatalogueBookSchemas(catalogueDefaults, saved);
  const values = { ...catalogueBook(), id: saved.bookId, price: '-2.25' };
  await expect(schemas[0].validateAt('price', values)).rejects.toBeDefined();
  await expect(schemas[2].validateAt('price', values)).rejects.toBeDefined();
});
