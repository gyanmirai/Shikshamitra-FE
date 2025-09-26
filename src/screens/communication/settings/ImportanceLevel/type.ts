import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IImportanceLevel {
  levelName: string;
  description: string;
  color: string;
}

export interface IImportanceLevelTableProps {
  data: IImportanceLevel[];
  onAddImportanceLevel: { onTrue: () => void };
  setOpenDialog: (val: boolean) => void;
  setEditData: (val: IImportanceLevel | null) => void;
  onDelete: (row: IImportanceLevel) => void;
  onEdit: (row: IImportanceLevel) => void;
}

export interface IImportanceLevelFormProps {
  open: UseBooleanReturn;
  onClose: (event?: unknown, isSaved?: boolean) => void;
  editData: IImportanceLevel | null;
}
