import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IBookCategory {
  id: string;
  categoryName: string;
  code: string;
  createdBy: string;
  createdDate: string;
}

export interface IBookCategoryTableProps {
  data: IBookCategory[];
  onAddBookCategory: UseBooleanReturn;
  setOpenDialog: (open: boolean) => void;
  setEditData: (data: IBookCategory | null) => void;
  onDelete: (row: IBookCategory) => void;
  onEdit: (row: IBookCategory) => void;
  open: boolean;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  totalCount?: number;
}

export interface IBookCategoryFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IBookCategory | null;
}
