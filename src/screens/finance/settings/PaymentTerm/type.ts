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
  /** Optional override of the attached Collection Policy's gracePeriodDays for this installment only; inherits the policy value when null. */
  gracePeriod: number | null;
  /** Optional override of the attached Payment Policy's allowPartialPayment for this installment only; inherits the policy value when unset. */
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

  // Holiday Rules (due-date shifting is a scheduling concern, kept here rather than on Payment Policy)
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';

  // Billing Schedule
  demandGenerationRule: DemandGenerationRule;
  demandOffsetDays: number | null;
  initialDemandStatus: InitialDemandStatus;

  isUsedInDownstream?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaymentTermTableProps {
  loading: boolean;
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
