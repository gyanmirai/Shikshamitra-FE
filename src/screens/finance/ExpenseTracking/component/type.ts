import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IExpenseFormValues {
  id: any;
  paymentDetails: any;
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
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IExpenseFormValues | null;
}
