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
  reason: editData?.reason || '',
  concessions: editData?.concessions?.length
    ? editData.concessions.map((c) => ({
        concessionType: c.concessionType || '',
        applicableFeeHeads: c.applicableFeeHeads || [],
        amount: c.amount || undefined,
        percentage: c.percentage || undefined,
        documents: c.documents || [],
      }))
    : [],
});
