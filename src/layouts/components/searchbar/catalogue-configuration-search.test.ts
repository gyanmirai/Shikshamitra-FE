import { it, expect } from 'vitest';
import libraryModule from 'src/constants/library-menus';

import { getAllItems } from './utils';

it('offers catalogue configuration in search only under its own exact View grant', () => {
  const data = Object.values(libraryModule).flat();
  const path = '/library/settings/catalogue-configuration';
  expect(
    getAllItems({
      data,
      permissions: [
        { name: 'Library.Settings.View', isGranted: true },
        { name: 'Library.Settings.BookCategories.View', isGranted: true },
      ],
    }).some((item) => item.path === path)
  ).toBe(false);
  expect(
    getAllItems({
      data,
      permissions: [{ name: 'Library.Settings.CatalogueConfiguration.View', isGranted: true }],
    }).some((item) => item.path === path)
  ).toBe(true);
});
