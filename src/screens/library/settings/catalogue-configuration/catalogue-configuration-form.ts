import type {
  CatalogueDefinition,
  CatalogueRequiredField,
} from 'src/redux/library/catalogue-configuration-types';

import * as yup from 'yup';

export const catalogueFields: { value: CatalogueRequiredField; label: string }[] = [
  { value: 'author', label: 'Author' },
  { value: 'isbn', label: 'ISBN' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'edition', label: 'Edition' },
  { value: 'subject', label: 'Subject' },
  { value: 'language', label: 'Language' },
  { value: 'applicableAge', label: 'Applicable age' },
  { value: 'material', label: 'Material' },
];

export const copyCatalogueDefinition = (value: CatalogueDefinition): CatalogueDefinition => ({
  requiredFields: [...value.requiredFields],
  languages: value.languages.map((item) => ({ ...item })),
  materials: value.materials.map((item) => ({ ...item })),
});

export function catalogueConfigurationSchema(previous: CatalogueDefinition) {
  const choices = (field: 'languages' | 'materials') =>
    yup
      .array()
      .of(
        yup.object({
          code: yup
            .string()
            .required('Code is required')
            .matches(
              /^[a-z][a-z0-9_-]{0,31}$/,
              'Use a lowercase code starting with a letter, up to 32 characters.'
            ),
          label: yup.string().trim().required('Label is required').max(128),
          isActive: yup.boolean().required(),
        })
      )
      .required()
      .max(200, 'You can configure up to 200 choices.')
      .test(
        'unique-codes',
        'Choice codes must be unique.',
        (items) => new Set(items?.map((item) => item.code)).size === items?.length
      )
      .test(
        'retain-saved',
        'Retire saved choices instead of removing or changing their codes.',
        (items) => previous[field].every((saved) => items?.some((item) => item.code === saved.code))
      );
  return yup.object({
    requiredFields: yup
      .array()
      .of(
        yup
          .mixed<CatalogueRequiredField>()
          .oneOf(catalogueFields.map((item) => item.value))
          .required()
      )
      .required()
      .test(
        'unique-required',
        'Required fields must be unique.',
        (items) => new Set(items).size === items?.length
      ),
    languages: choices('languages'),
    materials: choices('materials'),
  });
}
