import * as yup from 'yup';

export const bookValidationSchema = [
  // Step 0: General Information (all fields except copies)
  yup.object().shape({
    title: yup
      .string()
      .trim()
      .required('Title is required')
      .min(2, 'Title must be at least 2 characters')
      .max(100, 'Title cannot exceed 100 characters'),

    isbn: yup
      .string()
      .trim()
      .required('ISBN is required')
      .matches(/^\d{10}(\d{3})?$/, 'ISBN must be 10 or 13 digits'),

    author: yup
      .string()
      .trim()
      .required('Author is required')
      .max(100, 'Author name cannot exceed 100 characters'),

    publisher: yup
      .string()
      .trim()
      .required('Publisher is required')
      .max(100, 'Publisher name cannot exceed 100 characters'),

    category: yup.string().trim().required('Category is required'),

    language: yup.string().trim().required('Language is required'),

    numberOfCopies: yup
      .number()
      .required('Number of copies is required')
      .integer('Number of copies must be a whole number')
      .min(1, 'At least one copy is required')
      .max(1000, 'Cannot add more than 1000 copies at once'),

    price: yup
      .number()
      .required('Price is required')
      .min(0, 'Price cannot be negative')
      .max(100000, 'Price cannot exceed 100000')
      .test('decimal-places', 'Price can have up to 2 decimal places', (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(String(value));
      }),

    // optional: file uploads or cover images
    bookCoverImages: yup.array().of(yup.string().url('Must be a valid URL')).nullable(),
    documents: yup.array().nullable(),

    // We don't deeply validate copies here (copies validated in Step 1),
    // but optionally ensure it's an array (not required in Step 0).
    copies: yup.array().nullable(),
  }),

  // Step 1: Copies management (deep validation for copies array)
  yup.object().shape({
    copies: yup
      .array()
      .of(
        yup.object().shape({
          copyNo: yup
            .number()
            .required('Copy number is required')
            .integer('Copy number must be a whole number')
            .min(1, 'Copy number must be at least 1'),

          // according to your earlier schema; 12 digits required
          //   accessionNo: yup
          //     .string()
          //     .required('Accession number is required')
          //     .matches(/^\d{12}$/, 'Accession number must be 12 digits'),

          rfidEnabled: yup.boolean().required(),

          rfidId: yup
            .string()
            .nullable()
            .when('rfidEnabled', {
              is: true,
              then: (schema) => schema.required('RFID is required '),
            }),

          // vendor present in UI — make it required (or change to .nullable() if optional)
          vendor: yup.string(),
        })
      )
      .required('At least one copy is required')
      .min(1, 'At least one book copy is required')
      // Unique accession number test
      .test('unique-accessionNo', 'Accession numbers must be unique', (copies) => {
        if (!copies) return true;
        const ids = copies.map((c: any) => c?.accessionNo ?? '');
        const set = new Set(ids);
        return set.size === ids.length;
      })
      // Ensure copies length matches numberOfCopies from the parent object
      .test(
        'matches-numberOfCopies',
        'Number of copy rows must match "Number of Copies" set in General Information',
        function (copies) {
          // this.parent is the parent object validated by this schema (root object)
          const numberOfCopies = this.parent?.numberOfCopies;
          if (numberOfCopies === undefined || numberOfCopies === null) return true;
          if (!copies) return false;
          return copies.length === Number(numberOfCopies);
        }
      ),
  }),

  // Step 2: Review / final step (no extra validation; keep available for future rules)
  yup.object().shape({}),
];
