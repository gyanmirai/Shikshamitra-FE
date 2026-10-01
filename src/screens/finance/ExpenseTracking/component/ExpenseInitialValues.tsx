import dayjs from 'dayjs';

import type { IExpenseFormValues } from './type';

export const getInitialExpenseData = (editData: IExpenseFormValues | null): IExpenseFormValues => ({
  id: editData?.id,
  categoryId: editData?.categoryId ?? '',
  categoryTags: editData?.categoryTags ?? [],
  name: editData?.name ?? '',
  amount: editData?.amount ?? null,
  paymentMethod: editData?.paymentMethod !== undefined ? editData.paymentMethod : '',
  paymentDate: editData?.paymentDate ? dayjs(editData.paymentDate) : null,
  notes: editData?.notes ?? '',
});
