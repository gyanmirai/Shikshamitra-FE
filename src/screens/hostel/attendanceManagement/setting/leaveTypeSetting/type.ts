import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface ILeaveType {
  leaveTypeName: string;
  backgroundColor: string;
}

export interface ILeaveTypeFormProps {
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: ILeaveType | null;
}
