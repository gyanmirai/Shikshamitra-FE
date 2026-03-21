import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/useBoolean';

// Define strict type for payment details
export interface IPaymentDetails {
  [key: string]: string | number | null | undefined;
}

export interface IExpenseRecord {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryTags: string[];
  name: string;
  amount: number;
  paymentMethod: number;
  paymentDate: string;
  notes: string;
  createdAt: string;
}

export interface IExpenseFormValues {
  id?: string;
  categoryId: string;
  categoryTags: string[];
  name: string;
  amount: number | null;
  paymentMethod: number | '';
  paymentDate: Dayjs | null;
  notes: string;
}

export interface IExpenseFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IExpenseFormValues | null;
}
