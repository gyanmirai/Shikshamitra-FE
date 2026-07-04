import type { IFeeCategory } from './type';

export const getFeeCategoryInitialValues = (editData?: IFeeCategory | null) => ({
  categoryName: editData?.name || (editData as any)?.categoryName || '',
  description: editData?.description || '',
  feeHeads:
    editData?.feeHeads?.map((fh) => ({
      feeHeadId: fh.feeHeadId || '',
      name: fh.feeHeadName || (fh as any).name || '',
      module: (fh as any).module || '',
      description: fh.description || '',
      isConcessionApply: fh.isConcessionApply || false,
    })) || [],
});
