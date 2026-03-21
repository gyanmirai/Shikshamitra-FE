import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IFeeHead {
  id: string;
  feeCategoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface IFeeHeadTableProps {
  data: IFeeHead[];
  isLoading: boolean;
  onAddFeeHead: any;
  editData: IFeeHead | null;
  setEditData: (value: IFeeHead | null) => void;
  onEdit: (row: IFeeHead) => void;
  onDelete: (row: IFeeHead) => void;
  onToggle: (row: IFeeHead) => void;
}

export interface IFeeHeadFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IFeeHead | null;
}
