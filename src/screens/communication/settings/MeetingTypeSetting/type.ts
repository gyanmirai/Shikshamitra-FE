import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IMeetingType {
  meetingType: string;
  description: string;
  createdBy: string;
  createdDate: string;
}

export interface IMeetingTypeTableProps {
  data: IMeetingType[];
  onAddMeetingType: { onTrue: () => void };
  setOpenDialog: (val: boolean) => void;
  setEditData: (val: IMeetingType | null) => void;
  onDelete: (row: IMeetingType) => void;
  onEdit: (row: IMeetingType) => void;
}

export interface IMeetingFormProps {
  open: UseBooleanReturn;
  onClose: (event?: unknown, isSaved?: boolean) => void;
  editData: IMeetingType | null;
}
