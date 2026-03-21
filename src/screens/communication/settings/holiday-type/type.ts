import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IHolidayType {
  id?: string;
  name: string;
  description: string;
  color: string;
}

export interface IHolidayTypeTableProps {
  data: IHolidayType[];
  onAddHolidayType: { onTrue: () => void };
  setOpenDialog: (val: boolean) => void;
  setEditData: (val: IHolidayType | null) => void;
  onDelete: (row: IHolidayType) => void;
  onEdit: (row: IHolidayType) => void;
  isLoading: boolean;
}

export interface IHolidayFormProps {
  open: UseBooleanReturn;
  onClose: (event?: unknown, isSaved?: boolean) => void;
  editData: IHolidayType | null;
}
