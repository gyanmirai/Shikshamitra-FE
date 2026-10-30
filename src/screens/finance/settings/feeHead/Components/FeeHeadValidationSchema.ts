import { financeNameSchema } from 'src/utils/finance-name';
import * as Yup from 'yup';

import type { IFeeHead } from './type';

export const feeHeadValidationSchema = (existingNames: Set<string>, editData?: IFeeHead | null) =>
  Yup.object().shape({
    feeCategoryId: Yup.string().required('Fee Category is required'),
    name: financeNameSchema('Fee Head Name')
      .required('Fee Head Name is required')
      .test('unique-fee-head', 'This fee head name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
    incomeCategoryId: Yup.string().required('Income Category is required'),
  });
