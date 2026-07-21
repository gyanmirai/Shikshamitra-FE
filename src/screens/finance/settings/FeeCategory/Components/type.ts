export interface IFeeCategory {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  deactivationReason?: string | null;
  isUsedInDownstream?: boolean;
  feeHeads?: Array<{
    id?: string;
    feeHeadId: string;
    feeHeadName?: string;
    name?: string;
    module?: string;
    description?: string;
    isConcessionApply?: boolean;
    isActive?: boolean;
  }>;
}
export interface IFeeCategoryTableProps {
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
