import { financeNameSchema } from 'src/utils/finance-name';
import * as yup from 'yup';

export const finaceFeeStructureValidationSchema = [
  // Step 1: Fee Structure Basic Details
  yup.object().shape({
    name: financeNameSchema('Fee Structure Name').required('Fee Structure Name is required'),
    boardId: yup.string().required('Board is required'),
    mediumId: yup.string().required('Medium is required'),
    receiptBookId: yup.string().required('Receipt Book is required'),
    paymentMethod: yup.array().of(yup.string()).min(1, 'At least one Payment Method is required'),
  }),

  // Step 2: Class-wise Fee Details
  yup.object().shape({
    feeStructureClasses: yup
      .object()
      .test(
        'has-classes',
        'At least one class must be added',
        (value) => value && Object.values(value).some((arr: any) => arr.length > 0)
      )
      .shape(
        Object.fromEntries(
          Array.from({ length: 12 }, (_, i) => [
            String(i + 1),
            yup.array().of(
              yup.object().shape({
                feeStructureName: financeNameSchema('Class Fee Structure Name').required(
                  'Class Fee Structure Name is required'
                ),
                status: yup.string().required('Status is required'),
                feeItems: yup
                  .array()
                  .of(
                    yup.object().shape({
                      feeCategory: yup.string().required('Fee Category is required'),
                      feeHead: yup.string().required('Fee Head is required'),
                      amount: yup
                        .number()
                        .typeError('Amount must be a number')
                        .required('Amount is required')
                        .min(0, 'Amount must be greater than or equal to 0'),
                      isOneTime: yup.boolean().required(),
                      required: yup.boolean().required(),
                    })
                  )
                  .min(1, 'At least one Fee Item is required'),
              })
            ),
          ])
        )
      ),
  }),
];
