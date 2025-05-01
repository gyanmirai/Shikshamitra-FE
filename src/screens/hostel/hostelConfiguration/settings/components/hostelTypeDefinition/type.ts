import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IHostelType {
  hostelTypeName: string;
  description: string;
}

export interface IHostelTypeFormProps {
  dialog: UseBooleanReturn;
  editData: IHostelType | null;
  onClose: (e: any, isSubmit: boolean) => void;
}
