import type { IConcessionTypeForm } from '../type';

export const getInitialConcessionTypeData = (
  editData?: Partial<IConcessionTypeForm> | null
): IConcessionTypeForm => ({
  concessionName: editData?.concessionName || '',
  concessionType: editData?.concessionType || 'fixed',
  amount: editData?.amount ?? (editData?.concessionType === 'fixed' ? 0 : undefined),
  percentage: editData?.percentage ?? (editData?.concessionType === 'percentage' ? 0 : undefined),
  applicableFeeHeads: editData?.applicableFeeHeads || [],
  documentRequired: editData?.documentRequired ?? false,
  documents: editData?.documents ?? [],
  description: editData?.description || '',
});
