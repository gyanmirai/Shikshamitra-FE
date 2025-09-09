import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IConditionType {
  conditionType: string;
  code: string;
  createdBy: string;
  createdDate: string;
  description: string;
}

export interface IConditionTypeTableProps {
  data: IConditionType[];
  onAddConditionType: { onTrue: () => void };
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IConditionType | null) => void;
  onDelete: (row: IConditionType) => void;
  onEdit: (row: IConditionType) => void;
  open: UseBooleanReturn;
}

export interface IBookConditionFormProps {
  open: { value: boolean; onTrue: () => void; onFalse: () => void };
  onClose: (event: any, isSubmit?: boolean) => void;
  editData?: IConditionType | null;
}
