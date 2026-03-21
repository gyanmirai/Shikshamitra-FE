import { ConcessionBasedOn } from '../type';

import type { IConcessionTypeForm } from '../type';

export const getInitialConcessionTypeData = (editData?: any | null): IConcessionTypeForm => {
  const isPercentage = editData?.basedOn === ConcessionBasedOn.Percentage;
  const isFixed = editData?.basedOn === ConcessionBasedOn.Fixed;

  return {
    id: editData?.id,
    name: editData?.name || editData?.name || '',
    concessionType: isPercentage ? 'percentage' : 'fixed',
    amount: isFixed
      ? editData?.amount
      : editData?.concessionType === 'fixed'
        ? editData?.amount
        : 0,
    percentage: isPercentage
      ? editData?.amount
      : editData?.concessionType === 'percentage'
        ? editData?.percentage
        : 0,
    applicableFeeHeads: (editData?.applicableFeeHeads || []).map((head: any) =>
      typeof head === 'object' ? head.id : head
    ),
    documentRequired: editData?.isDocumentRequired ?? editData?.documentRequired ?? false,
    documents: (editData?.documents || []).map((doc: any) => ({
      ...doc,
      documentSize: doc.documentSize
        ? Math.round(doc.documentSize / (1024 * 1024))
        : doc.documentSize,
    })),
    description: editData?.description || '',
  };
};
