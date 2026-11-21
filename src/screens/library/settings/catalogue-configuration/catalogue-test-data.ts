import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import { getInitialBookData } from '../../BookManagement/Components/BookManageInitialValues';

import type { BookFormValues } from '../../BookManagement/Components/type';

export const catalogueDefaults: CatalogueConfiguration = {
  revision: 'defaults-v1',
  source: 'Defaults',
  canManageConfiguration: false,
  requiredFields: ['author', 'language'],
  languages: [
    { code: 'gu', label: 'Gujarati (ગુજરાતી)', isActive: true },
    { code: 'hi', label: 'Hindi (हिंदी)', isActive: true },
    { code: 'en', label: 'English', isActive: true },
    { code: 'mr', label: 'Marathi (मराठी)', isActive: true },
    { code: 'sa', label: 'Sanskrit (संस्कृत)', isActive: true },
  ],
  materials: [],
};

export const catalogueSchool: CatalogueConfiguration = {
  ...catalogueDefaults,
  revision: 'school-revision-1',
  source: 'School',
  canManageConfiguration: true,
  requiredFields: ['language'],
  languages: [
    ...catalogueDefaults.languages,
    { code: 'bn', label: 'Bengali (বাংলা)', isActive: true },
  ],
  materials: [{ code: 'picturebook', label: 'Picture book', isActive: true }],
};

export const catalogueBook = (): BookFormValues => ({
  ...getInitialBookData({
    title: 'Stories',
    author: 'Asha Patel',
    categoryId: 'category-id',
    language: 2,
    price: 125.25,
  }),
  languageCode: 'en',
  materialCode: null as string | null,
  expectedCatalogueConfigurationRevision: catalogueDefaults.revision,
});
