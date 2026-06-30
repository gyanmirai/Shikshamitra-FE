import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IExpenseCategory {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  isActive?: boolean;
  deactivationReason?: string | null;
}

export interface IExpenseCategoryTableProps {
  data: IExpenseCategory[];
  onAddExpenseCategory: any;
  editData: IExpenseCategory | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IExpenseCategory | null) => void;
  onDelete: (row: IExpenseCategory) => void;
  onEdit: (row: IExpenseCategory) => void;
  isLoading?: boolean;
  totalCount?: number;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
}

export interface IExpenseCategoryFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IExpenseCategory | null;
}
