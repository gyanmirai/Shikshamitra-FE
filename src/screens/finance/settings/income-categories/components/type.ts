import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IIncomeCategory {
  id: string;
  name: string;
  description?: string;
  tags: string[];
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
}

export interface IIncomeCategoryFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IIncomeCategory | null;
}
