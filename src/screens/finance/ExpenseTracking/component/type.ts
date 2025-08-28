import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IExpenseFormValues {
  expenseCategory: string;
  budget: string;
  budgetSubCategory: string;
  expenseName: string;
  amount: number | null;
  paymentMethod: string;
  date: string | Dayjs | null; // formatted as YYYY-MM-DD
  notes: string;
}

export interface IExpenseFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IExpenseFormValues | null;
}
