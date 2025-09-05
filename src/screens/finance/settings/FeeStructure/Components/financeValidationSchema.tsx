import * as yup from 'yup';

export const finaceFeeStructureValidationSchema = [
  // Step 1: Fee Structure Basic Details
  yup.object().shape({
    feeStructureName: yup.string().required('Fee Structure Name is required'),
    academicYear: yup.string().required('Academic Year is required'),
    board: yup.string().required('Board is required'),
    medium: yup.string().required('Medium is required'),
    receiptBook: yup.string().required('Receipt Book is required'),
    paymentTerm: yup.string().required('Payment Term is required'),
    paymentMethod: yup.array().of(yup.string()).min(1, 'At least one Payment Method is required'),
  }),

  // Step 2: Class-wise Fee Details
  yup.object().shape({
    feeStructureClasses: yup
      .object()
      .test(
        'has-classes',
        'At least one class must be added',
        (value) => value && Object.keys(value).length > 0
      )
      .test('validate-class-fee-data', 'Invalid class fee data', (value) => {
        if (!value) return false;

        try {
          Object.values(value).forEach((classData: any) => {
            yup
              .array()
              .of(
                yup.object().shape({
                  feeStructureName: yup.string().required('Class Fee Structure Name is required'),
                  status: yup.string().required('Status is required'),
                  feeItems: yup
                    .array()
                    .of(
                      yup.object().shape({
                        feeCategory: yup.string().required('Fee Category is required'),
                        feeHead: yup.string().required('Fee Head is required'),
                        amount: yup
                          .number()
                          .required('Amount is required')
                          .min(0, 'Amount must be greater than or equal to 0'),
                        isOneTime: yup.boolean().required(),
                        required: yup.boolean().required(),
                      })
                    )
                    .min(1, 'At least one Fee Item is required'),
                })
              )
              .validateSync(classData); // validate each class array
          });
          return true;
        } catch (err) {
          return false;
        }
      }),
  }),
];
