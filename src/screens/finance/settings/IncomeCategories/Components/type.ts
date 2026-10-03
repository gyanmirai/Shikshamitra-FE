import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IIncomeCategory {
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

export interface IIncomeCategoryTableProps {
  data: IIncomeCategory[];
  onAddIncomeCategory: any;
  editData: IIncomeCategory | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IIncomeCategory | null) => void;
  onDelete: (row: IIncomeCategory) => void;
  onEdit: (row: IIncomeCategory) => void;
  isLoading?: boolean;
  totalCount?: number;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
}

export interface IIncomeCategoryFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IIncomeCategory | null;
}
