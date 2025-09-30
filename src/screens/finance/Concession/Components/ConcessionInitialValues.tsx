import type { IConcession } from '../type';

export const getInitialConcessionFormData = (
  editData?: Partial<IConcession> | null
): IConcession => ({
  board: editData?.board || '',
  medium: editData?.medium || '',
  className: editData?.className || '',
  division: editData?.division || '',
  feeHead: editData?.feeHead || '',
  studentName: editData?.studentName || '',
  concessionType: editData?.concessionType || '',
  reason: editData?.reason || '',
  documents: editData?.documents || [],
  amount: editData?.amount ?? (editData?.concessionType === 'fixed' ? 0 : undefined),
  percentage: editData?.percentage ?? (editData?.concessionType === 'percentage' ? 0 : undefined),
  applicableFeeHeads: editData?.applicableFeeHeads || [],
});
