import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IFeeHead {
  id: string;
  feeCategoryId: string;
  feeHeadName: string;
  description?: string;
  toggle: boolean;
}

export interface IFeeHeadTableProps {
  data: IFeeHead[];
  onAddFeeHead: any;
  editData: IFeeHead | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IFeeHead | null) => void;
  onEdit: (row: IFeeHead) => void;
  activeDialog: UseBooleanReturn;
  selectedEntry: IFeeHead | null;
  setSelectedEntry: (entry: IFeeHead | null) => void;
}

export interface IFeeHeadFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IFeeHead | null;
}
