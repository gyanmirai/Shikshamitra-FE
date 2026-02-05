import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

// Define strict type for payment details
export interface IPaymentDetails {
  [key: string]: string | number | null | undefined;
}

export interface IExpenseFormValues {
  id?: string | number; // Added optional id for edit mode
  paymentDetails: IPaymentDetails;
  expenseCategory: string;
  expenseCategoryTags: string[];
  expenseName: string;
  amount: number | null;
  paymentMethod: string;
  date: Dayjs | null; // formatted as YYYY-MM-DD
  notes: string;
}

export interface IExpenseFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IExpenseFormValues | null;
}
