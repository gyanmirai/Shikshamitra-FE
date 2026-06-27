import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export type PaymentTermStatus = 'Active' | 'Archived';
export type DemandGenerationRule = 'Immediately' | 'XDaysBeforeDue' | 'OnDueDate' | 'Manual';
export type InitialDemandStatus = 'Draft' | 'Published';

export interface IInstallment {
  id?: string | number;
  installmentName: string;
  sequence: number;
  startDate: string | null | Dayjs;
  dueDate: string | null | Dayjs;
  endDate: string | null | Dayjs;
  description: string;
  reminderDate: string | null | Dayjs;
  gracePeriod: number | null;
  lateFeePolicyId: string | null;
  lateFeePolicyName?: string;
  allowPartialOverride: boolean;
  demandEnabled: boolean;
  reminderEnabled: boolean;
}

export interface IPaymentTerm {
  id?: string | number;
  paymentTermName: string;
  paymentTermCode: string;
  boardId: string;
  boardName?: string;
  description: string;
  status: PaymentTermStatus;
  academicYearId: string;
  academicYearName?: string;
  totalInstallments?: number | string;
  installments: IInstallment[];
  isDefaultTerm: boolean;
  enableBillingSchedule?: boolean;

  // Reminder Rules (kept for API compatibility)
  autoReminder: boolean;
  reminderDaysBefore: number | null;
  reminderFrequencyDays: number | null;
  reminderMaxCount: number | null;

  // Holiday Rules (kept for API compatibility)
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';

  // Billing Schedule
  demandGenerationRule: DemandGenerationRule;
  demandOffsetDays: number | null;
  initialDemandStatus: InitialDemandStatus;

  // Advance & Partial Payment
  allowAdvancePayment: boolean;
  minAdvanceDays: number | null;
  maxAdvanceMonths: number | null;
  allowFullYearPayment: boolean;
  allowPartialInstallment: boolean;
  minPartialAmount: number | null;
  minPartialPercentage: number | null;

  isUsedInDownstream?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaymentTermTableProps {
  data: IPaymentTerm[];
  addPaymentTerm: UseBooleanReturn;
  setEditData: (value: IPaymentTerm | null) => void;
  onEdit: (row: IPaymentTerm) => void;
  onDelete: (row: IPaymentTerm) => void;
}

export interface IPaymentTermFormProps {
  open: boolean;
  onClose: (e?: any, isSubmit?: boolean) => void;
  editData: IPaymentTerm | null;
}
