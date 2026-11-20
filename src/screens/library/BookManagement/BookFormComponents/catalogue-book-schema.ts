import type {
  CatalogueChoice,
  CatalogueConfiguration,
  CatalogueRequiredField,
} from 'src/redux/library/catalogue-configuration-types';

import * as yup from 'yup';

import { cataloguePriceSchema } from './catalogue-price-schema';
import { copiesBookSchema, generalBookSchema } from './BookManageValidation';

export type PersistedCatalogueSelection = {
  bookId?: string;
  price?: string;
  languageCode?: string | null;
  materialCode?: string | null;
};

export function createCatalogueBookSchemas(
  configuration: CatalogueConfiguration,
  persisted?: PersistedCatalogueSelection
) {
  const required = (field: CatalogueRequiredField) => configuration.requiredFields.includes(field);
  const text = (field: CatalogueRequiredField, label: string, maximum?: number) => {
    let schema = yup.string().trim();
    if (maximum !== undefined)
      schema = schema.max(maximum, `${label} cannot exceed ${maximum} characters.`);
    return required(field) ? schema.required(`${label} is required`) : schema;
  };
  const choice = (
    field: 'language' | 'material',
    choices: CatalogueChoice[],
    previous?: string | null
  ) => {
    const label = field === 'language' ? 'Language' : 'Material';
    const schema = yup
      .string()
      .nullable()
      .test(
        'active-choice',
        `Choose an active ${field}.`,
        (value) =>
          !value ||
          value === previous ||
          choices.some((item) => item.code === value && item.isActive)
      );
    return required(field) ? schema.required(`${label} is required`) : schema;
  };
  const general = generalBookSchema.shape({
    price: cataloguePriceSchema(persisted),
    author: text('author', 'Author', 256),
    publisher: text('publisher', 'Publisher', 256),
    edition: text('edition', 'Edition', 50),
    subject: text('subject', 'Subject', 128),
    applicableAge: text('applicableAge', 'Applicable age', 10),
    isbn: text('isbn', 'ISBN')
      .test(
        'normalized-length',
        'ISBN cannot exceed 20 normalized characters.',
        (value) => !value || value.replace(/[\s-]/g, '').length <= 20
      )
      .test(
        'isbn-format',
        'Enter an ISBN-10 or ISBN-13, or leave it blank.',
        (value) => !value || /^(?:[0-9]{9}[0-9Xx]|[0-9]{13})$/.test(value.replace(/[\s-]/g, ''))
      ),
    language: yup.number().nullable().oneOf([0, 1, 2, 3, 4, null]),
    languageCode: choice('language', configuration.languages, persisted?.languageCode),
    materialCode: choice('material', configuration.materials, persisted?.materialCode),
  });
  return [general, copiesBookSchema, general.concat(copiesBookSchema)] as const;
}
