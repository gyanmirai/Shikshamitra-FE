import { it, expect } from 'vitest';
import {
  catalogueBook,
  catalogueSchool,
  catalogueDefaults,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';

import { createCatalogueBookSchemas } from './catalogue-book-schema';

it('keeps Author required under unchanged defaults', () => {
  expect(
    createCatalogueBookSchemas(catalogueDefaults)[0].isValidSync({
      ...catalogueBook(),
      author: '',
    })
  ).toBe(false);
});

it('allows an explicitly unknown author only when this school makes it optional', () => {
  expect(
    createCatalogueBookSchemas(catalogueSchool)[0].isValidSync({
      ...catalogueBook(),
      author: '',
    })
  ).toBe(true);
});

it('accepts the configured custom language without a fake numeric Gujarati fallback', () => {
  expect(
    createCatalogueBookSchemas(catalogueSchool)[0].isValidSync({
      ...catalogueBook(),
      language: null,
      languageCode: 'bn',
    })
  ).toBe(true);
});

it('requires Publisher when the actual school definition requires it', () => {
  const definition = { ...catalogueSchool, requiredFields: ['publisher'] as const };
  expect(
    createCatalogueBookSchemas({
      ...definition,
      requiredFields: [...definition.requiredFields],
    })[0].isValidSync({ ...catalogueBook(), publisher: '' })
  ).toBe(false);
});

it('requires an explicitly selected material only when the school requires material', () => {
  expect(
    createCatalogueBookSchemas({ ...catalogueSchool, requiredFields: ['material'] })[0].isValidSync(
      { ...catalogueBook(), materialCode: null }
    )
  ).toBe(false);
});

const retiredEnglish = {
  ...catalogueDefaults,
  languages: catalogueDefaults.languages.map((item) => ({
    ...item,
    isActive: item.code !== 'en',
  })),
};
it('rejects a retired language as a new selection', () => {
  expect(createCatalogueBookSchemas(retiredEnglish)[0].isValidSync(catalogueBook())).toBe(false);
});

it('preserves the exact existing retired language on an unrelated metadata edit', () => {
  expect(
    createCatalogueBookSchemas(retiredEnglish, { languageCode: 'en' })[0].isValidSync({
      ...catalogueBook(),
      publisher: 'Updated publisher',
    })
  ).toBe(true);
});

it.each([
  ['publisher', 256],
  ['edition', 50],
  ['subject', 128],
  ['applicableAge', 10],
] as const)('keeps the server %s limit even when the field is optional', (field, limit) => {
  expect(
    createCatalogueBookSchemas(catalogueSchool)[0].isValidSync({
      ...catalogueBook(),
      [field]: 'A'.repeat(limit + 1),
    })
  ).toBe(false);
});

it('validates normalized ISBN content while preserving a valid longer hyphenated raw draft', () => {
  const values = { ...catalogueBook(), isbn: '978-1-4-0-2-8-9-4-6-2-6' };
  expect(values.isbn.length).toBeGreaterThan(20);
  expect(createCatalogueBookSchemas(catalogueDefaults)[0].isValidSync(values)).toBe(true);
  expect(values.isbn).toBe('978-1-4-0-2-8-9-4-6-2-6');
});
