import type { IConcessionTypeForm } from '../type';

export const getInitialConcessionTypeData = (
  editData?: Partial<IConcessionTypeForm> | null
): IConcessionTypeForm => ({
  concessionName: editData?.concessionName || '',
  concessionType: editData?.concessionType || 'fixed',
  amount: editData?.amount ?? (editData?.concessionType === 'fixed' ? 0 : undefined),
  percentage: editData?.percentage ?? (editData?.concessionType === 'percentage' ? 0 : undefined),
  applicableFeeHeads: editData?.applicableFeeHeads || [],
  documentRequired: editData?.documentRequired ?? true,
  documents: editData?.documents || [
    { documentName: 'Income Certificate', documentSize: '5mb', acceptedFormat: 'jpg, png' },
    { documentName: 'Adhar Card', documentSize: '5mb', acceptedFormat: 'jpg, png' },
    { documentName: '10th Marksheet', documentSize: '5mb', acceptedFormat: 'jpg, png' },
  ],
  description: editData?.description || '',
});
