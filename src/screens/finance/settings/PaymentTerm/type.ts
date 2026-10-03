import type { Dayjs } from 'dayjs';
import type { SyntheticEvent } from 'react';
import type { PaymentTermListItem } from 'src/redux/finance/paymentTerm';

// ── Enums (aligned with backend PaymentTermEnums.cs) ──────────────────────────

export type PaymentTermStatus = 'Draft' | 'Active' | 'Archived';
export type PaymentTermVersionStatus = 'Draft' | 'Published' | 'Superseded' | 'Archived';
export type DemandGenerationRule =
  'OnInstallmentStartDate' | 'XDaysBeforeDue' | 'OnDueDate' | 'SpecificDate';
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
  /** Optional override of the attached Collection Policy's gracePeriodDays for this installment only; inherits the policy value when null. */
  gracePeriod: number | null;
  /** Optional override of the attached Payment Policy's allowPartialPayment for this installment only; inherits the policy value when unset. */
  allowPartialOverride: boolean | null;
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
  /** UI-level control that keeps invoice creation consistent across every installment. */
  invoiceCreationEnabled: boolean;
  isDefaultTerm: boolean;

  // Holiday Rules (due-date shifting is a scheduling concern, kept here rather than on Payment Policy)
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';

  // Billing Schedule
  demandGenerationRule: DemandGenerationRule;
  demandOffsetDays: number | null;
  initialDemandStatus: InitialDemandStatus;

  isUsedInDownstream?: boolean;
  /** False when term is referenced by fee structures — requires createRevision before draft edit */
  canDirectEdit?: boolean;

  // Version-related fields
  currentVersionId?: string;
  currentVersionNumber?: number;
  currentVersionStatus?: PaymentTermVersionStatus;
  hasDraft?: boolean;

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
  calculatedAmount: number | null;
  allowPartialOverride?: boolean | null;
  gracePeriodDaysOverride?: number | null;
}

export interface IResolvedFeeHeadSchedule {
  feeStructureDetailId: string;
  feeHeadId: string;
  feeHeadName: string;
  annualAmount: number | null;
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
  data: PaymentTermListItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  archived: boolean;
  onPaginationChange: (page: number, pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onView: (row: PaymentTermListItem) => void;
  onVersionHistory: (row: PaymentTermListItem) => void;
  onEdit: (row: PaymentTermListItem) => void;
  onDelete: (row: PaymentTermListItem) => void;
  onPublish: (row: PaymentTermListItem) => void;
  onArchive: (row: PaymentTermListItem) => void;
  onRestore: (row: PaymentTermListItem) => void;
  canView: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canRestore: boolean;
  canDelete: boolean;
  actionLoading: boolean;
}

export interface IPaymentTermFormProps {
  open: boolean;
  onClose: (event?: SyntheticEvent | null, isSubmit?: boolean) => void;
  editData: IPaymentTerm | null;
}
