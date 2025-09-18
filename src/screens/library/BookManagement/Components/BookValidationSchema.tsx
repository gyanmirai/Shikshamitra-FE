import * as Yup from 'yup';

export const bookValidationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),

  isbn: Yup.string()
    .trim()
    .required('ISBN is required')
    .matches(/^\d{10}(\d{3})?$/, 'ISBN must be 10 or 13 digits'),

  author: Yup.string()
    .trim()
    .required('Author is required')
    .max(100, 'Author name cannot exceed 100 characters'),

  publisher: Yup.string()
    .trim()
    .required('Publisher is required')
    .max(100, 'Publisher name cannot exceed 100 characters'),

  subject: Yup.string().trim().required('Subject is required'),

  category: Yup.string().trim().required('Category is required'),

  edition: Yup.string().trim().required('Edition is required'),

  language: Yup.string().trim().required('Language is required'),

  numberOfCopies: Yup.number()
    .required('Number of copies is required')
    .min(1, 'Must have at least 1 copy')
    .max(1000, 'Cannot exceed 1000 copies'),

  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price cannot exceed 100000')
    .test('decimal-places', 'Price can have up to 2 decimal places', (value) => {
      if (!value) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    }),

  bookCoverImages: Yup.array().of(Yup.string().url('Must be a valid URL')),

  copies: Yup.array()
    .of(
      Yup.object().shape({
        copyNo: Yup.number()
          .required('Copy number is required')
          .min(1, 'Copy number must be at least 1'),
        accessionNo: Yup.string().trim().required('Accession number is required'),
        rfidEnabled: Yup.boolean().required(),
        rfidId: Yup.string()
          .nullable()
          .when('rfidEnabled', {
            is: true,
            then: (schema) => schema.required('RFID ID is required if RFID is enabled'),
          }),
      })
    )
    .required('At least one copy is required')
    .min(1, 'At least one book copy is required')
    .test('unique-accessionNo', 'Accession numbers must be unique', (copies) => {
      if (!copies) return true;
      const accessionSet = new Set(copies.map((c) => c.accessionNo));
      return accessionSet.size === copies.length;
    }),
});
