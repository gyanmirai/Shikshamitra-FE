export interface IFeeCategory {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  deactivationReason?: string | null;
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
}

export interface IFeeCategoryFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IFeeCategory | null;
}
