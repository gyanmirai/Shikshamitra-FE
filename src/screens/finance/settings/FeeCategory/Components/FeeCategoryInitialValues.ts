import type { IFeeCategory } from './type';

export const getFeeCategoryInitialValues = (editData?: IFeeCategory | null) => ({
  name: editData?.name || '',
  description: editData?.description || '',
  feeHeads:
    editData?.feeHeads?.map((fh) => ({
      id: fh.id || '',
      isUsedInDownstream: fh.isUsedInDownstream || false,
      incomeCategoryId: fh.incomeCategoryId || '',
      name: fh.name || '',
      module: fh.module ?? '',
      description: fh.description || '',
      isConcessionApplied: fh.isConcessionApplied || false,
    })) || [],
});
