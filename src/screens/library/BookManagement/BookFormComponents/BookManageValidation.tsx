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
      .max(17, 'ISBN with hyphens cannot exceed 17 characters')
      // eslint-disable-next-line func-names
      .test('isbn-validation', 'Please enter a valid ISBN-10 or ISBN-13', function (value) {
        if (!value) return true;

        // Remove hyphens and spaces
        const cleanISBN = value.replace(/[-\s]/g, '');

        // Check basic format
        if (!/^[\dX]+$/i.test(cleanISBN)) {
          return this.createError({
            message: 'ISBN can only contain digits, hyphens, and X (for ISBN-10)',
          });
        }

        // Length check
        if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
          return this.createError({
            message: 'ISBN must be 10 or 13 digits (excluding hyphens)',
          });
        }

        return true;
      }),
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
    bookCoverImages: yup
      .array()
      .nullable()
      .transform((value, originalValue) => {
        // If the original value is a string, wrap it in an array
        if (typeof originalValue === 'string') {
          return [originalValue];
        }
        // If it's already an array or null/undefined, return as is
        return value;
      }),
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
          accessionNo: yup.string().required('Accession number is required'),
          // rfidEnabled: yup.boolean().required(),

          // rfidId: yup
          //   .string()
          //   .nullable()
          //   .when('rfidEnabled', {
          //     is: true,
          //     then: (schema) => schema.required('RFID is required '),
          //   }),

          // vendor present in UI — make it required (or change to .nullable() if optional)
          vendor: yup.string(),
          section: yup.string().required('Section is required'),
          shelf: yup.string().required('Shelf is required'),
        })
      )
      .required('At least one copy is required')
      .min(1, 'At least one book copy is required')
      .max(100, 'Cannot add more than 100 copies at once')
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
        // eslint-disable-next-line func-names
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
