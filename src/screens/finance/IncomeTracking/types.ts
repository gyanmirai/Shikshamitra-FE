import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IIncomeFormValues {
  id?: string | number; // Made optional for new entries
  paymentDetails: Record<string, any>; // More specific than any
  incomeCategory: string;
  incomeCategoryTags: string[];
  incomeName: string;
  amount: number | null;
  paymentMethod: string;
  date: Dayjs | null;
  notes: string;
}

export interface IIncomeTrackingFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IIncomeFormValues | null;
}
