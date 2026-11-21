import { it, expect } from 'vitest';
import { catalogueBook } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';

import { buildGeneralPayload } from './book-form-model';
import { getInitialBookData } from '../Components/BookManageInitialValues';

it('sends the exact session revision and custom codes without a numeric language invention', () => {
  const payload = buildGeneralPayload({
    ...catalogueBook(),
    expectedCatalogueConfigurationRevision: ' exact opened revision ',
    language: null,
    languageCode: 'bn',
    materialCode: 'picturebook',
  });
  expect(payload).toMatchObject({
    expectedCatalogueConfigurationRevision: ' exact opened revision ',
    language: null,
    languageCode: 'bn',
    materialCode: 'picturebook',
  });
});

it.each([
  [0, 'gu'],
  [1, 'hi'],
  [2, 'en'],
  [3, 'mr'],
  [4, 'sa'],
] as const)(
  'projects legacy language%s to %s without changing its original numeric value',
  (language, code) => {
    expect(getInitialBookData({ language })).toMatchObject({
      language,
      languageCode: code,
      materialCode: null,
    });
  }
);

it('retains saved custom/retired code identity through initial values and an unrelated update', () => {
  const values = getInitialBookData({
    id: 'book-id',
    language: null,
    languageCode: 'historic-language',
    materialCode: 'historic-material',
    languageLabel: 'Saved language',
  });
  expect(buildGeneralPayload({ ...values, publisher: 'Updated publisher' })).toMatchObject({
    language: null,
    languageCode: 'historic-language',
    materialCode: 'historic-material',
  });
});
