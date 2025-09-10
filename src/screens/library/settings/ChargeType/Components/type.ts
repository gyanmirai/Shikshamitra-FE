import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IChargeType {
  id: string;
  chargeType: string;
  amount: number;
  createdBy: string;
  createdDate: string;
}

export interface IChargeTypeTableProps {
  data: IChargeType[];
  onAddChargeType: UseBooleanReturn;
  setOpenDialog: (open: boolean) => void;
  setEditData: (data: IChargeType | null) => void;
  onDelete: (row: IChargeType) => void;
  onEdit: (row: IChargeType) => void;
  open: boolean;
}

export interface IChargeTypeFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IChargeType | null;
}
