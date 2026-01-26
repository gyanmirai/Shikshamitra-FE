import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IEventType {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface IEventTypeTableProps {
  data: IEventType[] | null;
  onAddEventType: UseBooleanReturn;
  setOpenDialog: (val: boolean) => void;
  setEditData: (data: IEventType | null) => void;
  onDelete: (row: IEventType) => void;
  onEdit: (row: IEventType) => void;
  isTableLoading: boolean;
}

export interface IEventFormProps {
  open: UseBooleanReturn;
  onClose: (event?: any, isSubmit?: boolean) => void;
  editData?: IEventType | null;
}
