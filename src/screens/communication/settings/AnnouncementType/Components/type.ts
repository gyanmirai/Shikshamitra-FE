import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IAnnouncementType {
  announcementType: string;
  description: string;
  color: string;
}

export interface IAnnouncementTypeTableProps {
  data: IAnnouncementType[];
  onAddAnnouncementType: { onTrue: () => void };
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IAnnouncementType | null) => void;
  onDelete: (row: IAnnouncementType) => void;
  onEdit: (row: IAnnouncementType) => void;
  open: UseBooleanReturn;
}

export interface IAnnouncementFormProps {
  open: { value: boolean; onTrue: () => void; onFalse: () => void };
  onClose: (event: any, isSubmit?: boolean) => void;
  editData?: IAnnouncementType | null;
}
