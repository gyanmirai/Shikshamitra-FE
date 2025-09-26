import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IHolidayType {
  holidayType: string;
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
}

export interface IHolidayFormProps {
  open: UseBooleanReturn;
  onClose: (event?: unknown, isSaved?: boolean) => void;
  editData: IHolidayType | null;
}
