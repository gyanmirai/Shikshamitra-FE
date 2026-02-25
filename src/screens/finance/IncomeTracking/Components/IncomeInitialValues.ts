import dayjs from 'dayjs';

import type { IIncomeRecord, IIncomeFormValues } from '../types';

export const getInitialIncomeData = (editData: IIncomeRecord | null): IIncomeFormValues => ({
  id: editData?.id,
  categoryId: editData?.categoryId ?? '',
  categoryTags: editData?.categoryTags ?? [],
  name: editData?.name ?? '',
  amount: editData?.amount ?? null,
  paymentMethod: editData?.paymentMethod ?? '',
  paymentDate: editData?.paymentDate ? dayjs(editData.paymentDate) : null,
  notes: editData?.notes ?? '',
});
