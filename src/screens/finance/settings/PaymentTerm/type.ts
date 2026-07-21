import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

// ── Enums (aligned with backend PaymentTermEnums.cs) ──────────────────────────

export type PaymentTermStatus = 'Active' | 'Archived';
export type PaymentTermVersionStatus = 'Draft' | 'Published' | 'Superseded' | 'Archived';
export type DemandGenerationRule = 'Immediately' | 'XDaysBeforeDue' | 'OnDueDate' | 'Manual';
export type InitialDemandStatus = 'Draft' | 'Published';
export type HolidayShiftingMethod = 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';
export type ScheduleMode = 'Inherited' | 'Customized';
export type ScheduleSource = 'PaymentTerm' | 'Legacy';

// ── Schedule-only Installment ─────────────────────────────────────────────────
// Payment behaviour (advance, partial, reminder policy) has been moved to
// Payment Policy per AGENTS.md. This interface owns ONLY scheduling data:
// coverage windows, demand/due dates, holiday shifting, and percentage allocation.

export interface IInstallment {
  id?: string;
  installmentName: string;
  sequence: number;

  // Coverage window
  startDate: string | null | Dayjs;
  endDate: string | null | Dayjs;

  // Demand & due dates
  demandDate: string | null | Dayjs;
  dueDate: string | null | Dayjs;

  // Description / label
  description: string;

  // Allocation — percentage of the attached fee-head annual amount (must total 100%)
  allocationPercentage: number;

  // Reminder scheduling (date only — reminder *policy* lives in Payment Policy)
  reminderDate: string | null | Dayjs;

  // Per-installment overrides (the ONLY payment-behaviour fields kept here)
  // Both inherit from their respective policy when null/unset.
  allowPartialOverride: boolean | null;
  gracePeriod: number | null;

  // Operational flags
  demandEnabled: boolean;
  reminderEnabled: boolean;
}

// ── Schedule-only Payment Term ────────────────────────────────────────────────
// NOTE: The following fields have been REMOVED per AGENTS.md decision 3/4:
//   - lateFeePolicyId / lateFeePolicyName (Collection Policy owns this now)
//   - autoReminder, reminderDaysBefore, reminderFrequencyDays, reminderMaxCount
//   - allowAdvancePayment, minAdvanceDays, maxAdvanceMonths, allowFullYearPayment
//   - allowPartialInstallment, minPartialAmount, minPartialPercentage
// All of the above are now governed by IPaymentPolicy.

export interface IPaymentTerm {
  id?: string;
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

  // Holiday Rules (schedule concern — shifts due dates)
  holidayShiftingMethod: HolidayShiftingMethod;

  // Billing Schedule / Demand generation
  demandGenerationRule: DemandGenerationRule;
  demandOffsetDays: number | null;
  initialDemandStatus: InitialDemandStatus;

  // Version tracking (new)
  currentVersionId?: string;
  currentVersionNumber?: number;
  isUsedInDownstream?: boolean;
  /** False when term is referenced by fee structures — requires createRevision before draft edit */
  canDirectEdit?: boolean;

  // Audit fields
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Version DTO (new) ─────────────────────────────────────────────────────────

export interface IPaymentTermVersion {
  id: string;
  versionNumber: number;
  status: PaymentTermVersionStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  publishedAt?: string;
  changeReason?: string;
  installments: IInstallment[];
}

// ── Resolved Schedule DTOs (new) ──────────────────────────────────────────────

export interface IResolvedInstallment {
  sequence: number;
  name: string;
  coverageStartDate: string;
  coverageEndDate: string;
  demandDate: string;
  dueDate: string;
  allocationPercentage: number;
  calculatedAmount: number;
  allowPartialOverride?: boolean | null;
  gracePeriodDaysOverride?: number | null;
}

export interface IResolvedFeeHeadSchedule {
  feeStructureDetailId: string;
  feeHeadId: string;
  feeHeadName: string;
  annualAmount: number;
  paymentTermId?: string;
  paymentTermName?: string;
  paymentTermVersionId?: string;
  versionNumber?: number;
  scheduleMode: ScheduleMode;
  installments: IResolvedInstallment[];
  validationWarnings: string[];
  isValid: boolean;
}

export interface IFeeStructureSchedulePreview {
  feeStructureId: string;
  feeStructureName: string;
  feeHeadSchedules: IResolvedFeeHeadSchedule[];
  isValid: boolean;
  validationErrors: string[];
  validationWarnings: string[];
}

// ── Schedule Override DTO (new) ───────────────────────────────────────────────

export interface IScheduleOverride {
  sourcePaymentTermInstallmentId: string;
  sequence: number;
  name: string;
  coverageStartDate?: string;
  coverageEndDate?: string;
  demandDate?: string;
  dueDate?: string;
  allocationPercentage?: number;
}

// ── Component Props (unchanged) ───────────────────────────────────────────────

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
