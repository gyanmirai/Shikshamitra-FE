import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { IParams } from 'src/components/customizabaleTable/types';

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
  isSystemCategory?: boolean;
  isUsedInDownstream: boolean;
  deletionBlockedReason?: string | null;
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
  filters?: IParams['filters'];
  onServerFilter?: (filters: IParams['filters']) => void;
  page?: number;
  rowsPerPage?: number;
}

export interface IIncomeCategoryFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IIncomeCategory | null;
}
