import type { FeeHeadModule } from 'src/redux/feeHeadModule/feeHeadModuleApi';
import type { IFeeCategoryResponse } from 'src/redux/feeCategory/feeCategoryApi';

export type IFeeCategory = IFeeCategoryResponse;

export interface IFeeCategoryFormHead {
  id?: string;
  isUsedInDownstream?: boolean;
  incomeCategoryId: string;
  name: string;
  module?: FeeHeadModule | null;
  isConcessionApplied: boolean;
  description: string;
}

export interface IFeeCategoryTableProps {
  archived: boolean;
  onAddFeeCategory: any;
  editData: IFeeCategory | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IFeeCategory | null) => void;
  totalCount?: number;
  isLoading?: boolean;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
  onView?: (data: IFeeCategory) => void;
}

export interface IFeeCategoryFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IFeeCategory | null;
}
