import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { IParams } from 'src/components/customizabaleTable/types';

export interface IExpenseCategory {
  id: string;
  code?: string;
  name: string;
  description?: string;
  tags: string[];
  effectiveFrom?: string;
  effectiveTo?: string | null;
  concurrencyStamp: string;
  version: number;
  canDelete: boolean;
  isUsedInDownstream: boolean;
  isActive: boolean;
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
  filters?: IParams['filters'];
  onServerFilter?: (filters: IParams['filters']) => void;
  page?: number;
  rowsPerPage?: number;
}

export interface IExpenseCategoryFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IExpenseCategory | null;
}
