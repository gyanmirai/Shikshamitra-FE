import { IAccountHead } from 'src/types/finance/account-head';

export type { IAccountHead };

export interface IAccountHeadTableProps {
  data: IAccountHead[];
  onAddAccountHead: any;
  editData: IAccountHead | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IAccountHead | null) => void;
  onDelete: (data: IAccountHead) => void;
  onEdit: (data: IAccountHead) => void;
  onPatchStatus?: (data: IAccountHead) => void;
  isLoading?: boolean;
  totalCount?: number;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
}

export interface IAccountHeadFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IAccountHead | null;
}
