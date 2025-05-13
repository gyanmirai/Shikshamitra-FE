import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface ITag {
  emergencyLevel: string;
  description: string;
}

export interface TagFormProps {
  dialog: UseBooleanReturn;
  onClose: (_e?: any, isSubmit?: boolean) => void;
  editData?: ITag | null;
}
