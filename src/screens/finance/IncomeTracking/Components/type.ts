import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IIncomeFormValues {
  paymentDetails: any;
  incomeCategory: string;
  budget: string;
  budgetSubCategory: string;
  incomeName: string;
  amount: number | null;
  paymentMethod: string;
  date: Dayjs | null; // formatted as YYYY-MM-DD
  notes: string;
}

export interface IIncomeTrackingFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IIncomeFormValues | null;
}
