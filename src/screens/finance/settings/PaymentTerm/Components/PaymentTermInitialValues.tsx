import type { IPaymentTerm } from '../type';

export const getInitialPaymentTermData = (
  editData?: Partial<IPaymentTerm> | null
): IPaymentTerm => ({
  id: editData?.id || '',
  paymentTermName: editData?.paymentTermName || '',
  totalInstallments: editData?.totalInstallments || '',
  academicYear: editData?.academicYear || '',
  board: editData?.board || '',
  medium: editData?.medium || '',
  installments: editData?.installments || [
    {
      id: 0,
      installmentName: '',
      percentage: 0,
      dueDate: null,
    },
  ],
});
