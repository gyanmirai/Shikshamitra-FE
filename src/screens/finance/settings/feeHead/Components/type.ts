import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IFeeHead {
  id: string;
  feeCategoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  deactivationReason?: string | null;
}

export interface IFeeHeadTableProps {
  data: IFeeHead[];
  isLoading: boolean;
  onAddFeeHead: any;
  editData: IFeeHead | null;
  setEditData: (value: IFeeHead | null) => void;
  onEdit: (row: IFeeHead) => void;
  onDelete: (row: IFeeHead) => void;
  totalCount?: number;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
}

export interface IFeeHeadFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IFeeHead | null;
}
