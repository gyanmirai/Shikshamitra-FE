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
});
