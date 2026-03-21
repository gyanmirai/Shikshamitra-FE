import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/useBoolean';

/** Shape returned by the API / table rows */
export interface IIncomeRecord {
  id?: string | number;
  categoryId: string;
  categoryName: string;
  name: string;
  categoryTags: string[];
  amount: number | null;
  paymentMethod: number;
  paymentDate: string;
  notes: string;
}

/** Formik form values shape */
export interface IIncomeFormValues {
  id?: string | number;
  categoryId: string;
  categoryTags: string[];
  name: string;
  amount: number | null;
  paymentMethod: number | '';
  paymentDate: Dayjs | null;
  notes: string;
}

export interface IIncomeTrackingFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IIncomeRecord | null;
}
