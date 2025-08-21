import type { IFeeStructure } from '../type';

export const getInitialFeeStructureData = (
  editData?: Partial<IFeeStructure> | null
): IFeeStructure => ({
  feeStructureName: editData?.feeStructureName || '',
  academicYear: editData?.academicYear || '',
  board: editData?.board || '',
  medium: editData?.medium || '',
  receiptBook: editData?.receiptBook || '',
  paymentTerm: editData?.paymentTerm || '',
  paymentMethod: editData?.paymentMethod || [],
  totalFeeHead: editData?.totalFeeHead ?? 0,
  totalClass: editData?.totalClass ?? 0,
  feeStructureClasses: editData?.feeStructureClasses || {},
  status: 0,
});
