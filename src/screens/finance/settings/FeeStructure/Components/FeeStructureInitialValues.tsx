import type { IFeeStructure } from '../type';

export const getInitialFeeStructureData = (
  currentYear: any,
  editData?: Partial<IFeeStructure> | null
): IFeeStructure => ({
  name: editData?.name || '',
  academicYearId: editData?.academicYearId || currentYear.id,
  academicYearName: editData?.academicYearName || currentYear.name,
  boardId: editData?.boardId || '',
  boardName: editData?.boardName || '',
  mediumId: editData?.mediumId || '',
  mediumName: editData?.mediumName || '',
  receiptBookId: editData?.receiptBookId || '',
  receiptBookName: editData?.receiptBookName || '',
  // paymentTerm: editData?.paymentTerm || '',
  // paymentMethod: editData?.paymentMethod || [],
  totalFeeHead: editData?.totalFeeHead ?? 0,
  totalClass: editData?.totalClass ?? 0,
  feeStructureClasses: editData?.feeStructureClasses || {},
  status: 0,
  id: editData?.id || undefined,
});

export const standardFeeStructureInitialValues = (data: any) => ({
  id: data?.id || undefined,
  feeStructureClasses: data?.standardFeeStructures || [],
});
