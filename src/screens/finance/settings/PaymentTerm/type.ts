import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IInstallment {
  id: number;
  installmentName: string;
  dueDate: null | Dayjs; // ISO date string e.g., "2025-03-30"
  reminderDate: null | Dayjs;
  gracePeriod: number | null;
  overdueCharges: number | null;
}

export interface IPaymentTerm {
  id: string | number;
  paymentTermName: string;
  totalInstallments: number | string;
  academicYearId: string;
  academicYear?: string;
  board: string;
  medium: string;
  installments: IInstallment[];
}

export interface IPaymentTermTableProps {
  data: IPaymentTerm[];
  addPaymentTerm: { onTrue: () => void };
  editData: IPaymentTerm | null;
  setEditData: (value: IPaymentTerm | null) => void;
  onEdit?: (row: IPaymentTerm) => void;
  onDelete?: (row: IPaymentTerm) => void;
}

export interface IFeeStructureFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IPaymentTerm | null;
}
