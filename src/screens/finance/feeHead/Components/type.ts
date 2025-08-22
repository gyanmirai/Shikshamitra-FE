import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IFeeHead {
  id: string;
  feeCategoryId: string;
  feeHeadName: string;
  description?: string;
}

export interface IFeeHeadTableProps {
  data: IFeeHead[];
  onAddFeeHead: any;
  editData: IFeeHead | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IFeeHead | null) => void;
  onDelete: (row: IFeeHead) => void;
  onEdit: (row: IFeeHead) => void;
}

export interface IFeeHeadFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IFeeHead | null;
}
