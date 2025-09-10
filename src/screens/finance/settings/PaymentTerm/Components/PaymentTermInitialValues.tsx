import type { IPaymentTerm } from '../type';

export const getInitialPaymentTermData = (
  editData?: Partial<IPaymentTerm> | null
): IPaymentTerm => ({
  id: editData?.id || '',
  paymentTermName: editData?.paymentTermName || '',
  totalInstallments: editData?.totalInstallments || '',
  academicYearId: editData?.academicYearId || '',
  board: editData?.board || '',
  medium: editData?.medium || '',
  installments: editData?.installments || [],
});
