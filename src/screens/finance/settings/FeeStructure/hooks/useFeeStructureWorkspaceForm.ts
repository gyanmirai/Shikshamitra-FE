import { financeNameSchema } from 'src/utils/finance-name';
import type { StructureRecord, StructureCandidate } from 'src/redux/finance/feeStructureWorkspace';

import * as Yup from 'yup';
import { useMemo } from 'react';
import { useFormik } from 'formik';

import { amountError, paymentTermError, structureCandidate } from '../feeStructureModel';

export default function useFeeStructureWorkspaceForm(
  record: StructureRecord | undefined,
  amountInputs: Record<string, string>
) {
  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: financeNameSchema('Fee Structure Name')
          .trim()
          .required('Enter a name for this Fee Structure.')
          .max(256, 'Use at most 256 characters.'),
        feeHeads: Yup.array().of(
          Yup.object({
            amount: Yup.mixed()
              .nullable()
              .test(
                'configured-amount',
                'Enter the total fee for this Fee Head.',
                function validateAmount(value) {
                  if (this.parent.isVariable) return true;
                  const error = amountError(
                    amountInputs[this.parent.feeHeadId] ??
                      (typeof value === 'number' || typeof value === 'string' ? value : null)
                  );
                  return error ? this.createError({ message: error }) : true;
                }
              ),
            paymentTermVersionId: Yup.string()
              .nullable()
              .test(
                'payment-term',
                'Select a published Payment Term for this Fee Head.',
                function validateTerm() {
                  return !paymentTermError(this.parent);
                }
              ),
          })
        ),
      }),
    [amountInputs]
  );
  const formik = useFormik<StructureCandidate>({
    initialValues: structureCandidate(record),
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: () => {},
  });
  return { formik, validationSchema };
}
