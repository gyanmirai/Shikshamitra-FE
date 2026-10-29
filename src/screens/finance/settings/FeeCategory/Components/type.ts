import type { IFeeCategoryResponse } from 'src/redux/feeCategory/feeCategoryApi';

export type IFeeCategory = IFeeCategoryResponse;

export interface IFeeCategoryFormHead {
  id?: string;
  isUsedInDownstream?: boolean;
  incomeCategoryId: string;
  name: string;
  isConcessionApplied: boolean;
  description: string;
}

export interface IFeeCategoryTableProps {
  onAddFeeCategory: any;
  setEditData: (value: IFeeCategory | null) => void;
  onView?: (value: IFeeCategory) => void;
}

export interface IFeeCategoryFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IFeeCategory | null;
  onBusyChange?: (busy: boolean) => void;
}
