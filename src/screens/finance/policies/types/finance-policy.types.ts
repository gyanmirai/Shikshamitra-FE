// ─── Enums & Union Types ───────────────────────────────────────────────────────

import type { CollectionAllocationBasis } from 'src/redux/feeCollection/feeCollection';

export type FinancePolicyKind = 'payment' | 'concession' | 'refund' | 'collection' | 'proration';

export type FinancePolicyStatus = 'Active' | 'Inactive' | 'Draft' | 'Published' | 'Archived';

export type AllocationMethod = 'FeeHeadPriority' | 'Proportional' | 'FIFO' | 'Manual';

export type MinPaymentType = 'FixedAmount' | 'Percentage' | 'InstallmentAmount';

export type ReceiptGenerationMode = 'Immediate' | 'OnApproval' | 'OnSettlement';

export type ConcessionCalculationMethod = 'Percentage' | 'FixedAmount' | 'FullWaiver';
export type ConcessionRoundOff = 'None' | 'RoundUp' | 'RoundDown' | 'NearestRupee';

export type RefundPayoutMethod = 'Cash' | 'Cheque' | 'DemandDraft' | 'BankTransfer' | 'Upi';

// ─── Common fields shared by all policy types ─────────────────────────────────

export interface IFinancePolicyBase {
  currentVersionId?: string | null;
  currentVersionNumber?: number;
  isAttachable?: boolean;
  id?: string;
  policyName: string;
  policyCode: string;
  description: string;
  status: FinancePolicyStatus;
  academicYearId: string;
  academicYearName?: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  isDefault?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Payment Policy ────────────────────────────────────────────────────────────

export interface IPaymentPolicyPaymentModes {
  cash: boolean;
  cheque: boolean;
  upi: boolean;
  card: boolean;
  neft: boolean;
  onlineGateway: boolean;
  cashLimit: number | null;
}

export interface IPaymentPolicy extends IFinancePolicyBase {
  policyType: 'payment';
  // Payment Behaviour
  allowPartialPayment: boolean;
  minimumPaymentType: MinPaymentType;
  minimumPaymentValue: number | null;
  allocationMethod: AllocationMethod;
  advancePaymentAllowed: boolean;
  receiptGeneration: ReceiptGenerationMode;
  autoDemand: boolean;
  autoReminder: boolean;
  // Partial Payment
  partialPaymentMinimumAmount: number | null;
  partialPaymentMinimumPercentage: number | null;
  // Advance Payment
  advancePaymentMaxAmount: number | null;
  advancePaymentCarryForward: boolean;
  // Receipt Rules
  receiptPrefix: string;
  receiptStartNumber: number | null;
  separateReceiptPerFeeHead: boolean;
  // Demand Generation
  demandGenerationDaysBefore: number | null;
  demandAutoApprove: boolean;
  // Reminder Rules
  reminderDaysBefore: number | null;
  reminderFrequencyDays: number | null;
  reminderMaxCount: number | null;
  // Payment Modes
  paymentModes: IPaymentPolicyPaymentModes;
  // Approval Rules
  requireApprovalAboveAmount: number | null;
  approvalRoleIds: string[];
  // Security
  allowRefund: boolean;
  allowAdjustment: boolean;
  allowWriteOff: boolean;
}

export type IPaymentPolicyFormValues = Omit<
  IPaymentPolicy,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'academicYearName'
>;

// ─── Shared late-fee escalation slab shape (used by Collection Policy) ────────

export interface ILateFeeEscalationRule {
  startDay: number;
  endDay: number | null;
  calculationType: 'Flat' | 'Percentage';
  value: number;
  maxFee?: number | null;
  roundOff?: string;
}

export interface ICollectionPolicyLateFeeRuleOverride {
  lateFeeType: ICollectionPolicy['lateFeeType'];
  flatAmount: number | null;
  percentage: number | null;
  percentageBase: ICollectionPolicy['percentageBase'];
  amountPerDay: number | null;
  amountPerWeek: number | null;
  amountPerMonth: number | null;
  compoundFrequency: ICollectionPolicy['compoundFrequency'];
  escalationRules: ILateFeeEscalationRule[];
  roundingMethod: ICollectionPolicy['roundingMethod'];
  maximumLateFeeAmount: number | null;
  maximumChargingDays: number | null;
}

export interface ICollectionPolicyFeeHeadOverride {
  feeHeadId: string;
  overrideMode: 'Inherit' | 'NoLateFee' | 'CustomRule';
  lateFeeRule: ICollectionPolicyLateFeeRuleOverride | null;
}

// ─── Concession Policy ────────────────────────────────────────────────────────

export interface IConcessionPolicy extends Omit<IFinancePolicyBase, 'status'> {
  policyType: 'concession';
  status: 'Draft' | 'Active' | 'Archived';
  isDefault: boolean;
  valueSource: 'PolicyFixed' | 'RequestEnteredWithinLimits';
  calculationMethod: ConcessionCalculationMethod;
  percentageValue: number | null;
  fixedAmount: number | null;
  maximumPercentage: number | null;
  maximumFixedAmount: number | null;
  roundOff: ConcessionRoundOff;
  applyOn: 'AllOutstanding' | 'CurrentInstallment' | 'FutureInstallments' | 'AllFees';
  autoCreateRefund?: boolean;
  version?: number;
  isUsedInDownstream?: boolean;
  concurrencyStamp: string;
  changeReason?: string;
  creationTime?: string;
  lastModificationTime?: string | null;
}

export type IConcessionPolicyFormValues = Omit<
  IConcessionPolicy,
  | 'id'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'academicYearName'
  | 'percentageValue'
  | 'maximumPercentage'
> & {
  percentageValue: number | string | null;
  maximumPercentage: number | string | null;
};

// ─── Refund Policy ────────────────────────────────────────────────────────────

export interface IRefundPolicy extends Omit<
  IFinancePolicyBase,
  'status' | 'effectiveFrom' | 'effectiveTo'
> {
  policyType: 'refund';
  status: 'Draft' | 'Active' | 'Archived';
  isDefault: boolean;
  feeHeadScope: 'AllFeeHeads' | 'SelectedFeeHeads';
  applicableFeeHeadIds: string[];
  feeHeadNames?: Record<string, string>;
  feeHeadStatuses?: Record<string, 'Active' | 'Inactive' | 'Deleted'>;
  includePaidCharges: boolean;
  includePaidLateFee: boolean;
  allowPartialRefund: boolean;
  amountMode: 'RemainingPaidAmount' | 'ManualUpToEligible' | 'FixedAmount' | 'Percentage';
  percentageValue: number | null;
  fixedAmount: number | null;
  maximumPerRequest: number | null;
  maximumPerStudentYear: number | null;
  roundingMethod: ConcessionRoundOff;
  deductionType: 'None' | 'FixedAmount' | 'Percentage';
  deductionValue: number | null;
  maximumDeduction: number | null;
  deductionExplanation: string;
  allowedPayoutMethods: RefundPayoutMethod[];
  processingTargetDays: number | null;
  expenseCategoryId?: string | null;
  expenseCategoryName?: string | null;
  defaultPayingBankAccountId?: string | null;
  defaultPayingBankAccountName?: string | null;
  version?: number;
  isUsedInDownstream?: boolean;
  concurrencyStamp: string;
  changeReason?: string;
  creationTime?: string;
  lastModificationTime?: string | null;
}

export type IRefundPolicyFormValues = Omit<
  IRefundPolicy,
  | 'id'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'academicYearName'
  | 'feeHeadNames'
  | 'feeHeadStatuses'
  | 'expenseCategoryName'
  | 'defaultPayingBankAccountName'
>;

// ─── Table row (list view) ────────────────────────────────────────────────────

export interface IFinancePolicyRow {
  id: string;
  policyName: string;
  policyCode: string;
  policyType: FinancePolicyKind;
  academicYearId: string;
  academicYearName: string;
  status: FinancePolicyStatus;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  updatedBy: string;
  updatedAt: string;
  isDefault: boolean;
  isUsedInDownstream?: boolean;
  concurrencyStamp?: string;
  version?: number;
  creationTime?: string;
  lastModificationTime?: string | null;
}

// ─── Drawer state ─────────────────────────────────────────────────────────────

export interface IFinancePolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  policyType: FinancePolicyKind;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

// ─── Table component props ────────────────────────────────────────────────────

export interface IFinancePolicyTableProps {
  policyType: FinancePolicyKind;
  onAdd: () => void;
  onEdit: (row: IFinancePolicyRow) => void;
  archived?: boolean;
}

// ─── Collection Policy ────────────────────────────────────────────────────────
export interface ICollectionPolicy extends Omit<
  IFinancePolicyBase,
  'effectiveFrom' | 'effectiveTo'
> {
  policyType: 'collection';
  status: 'Draft' | 'Active' | 'Archived';
  enableLateFee: boolean;
  gracePeriodDays: number;
  allocationBasis?: CollectionAllocationBasis;
  receiptGrouping?: 'Combined' | 'Separate';
  lateFeeApplyOnFeeHeads: string[];
  lateFeeType: 'Flat' | 'Percentage' | 'PerDay' | 'PerWeek' | 'PerMonth' | 'Compound' | 'Slab';
  flatAmount: number | null;
  percentage: number | null;
  percentageBase: 'OutstandingAmount' | 'OriginalFee' | 'RemainingBalance';
  amountPerDay: number | null;
  amountPerWeek: number | null;
  amountPerMonth: number | null;
  compoundFrequency: 'Daily' | 'Weekly' | 'Monthly';
  escalationRules: ILateFeeEscalationRule[];
  feeHeadOverrides: ICollectionPolicyFeeHeadOverride[];
  roundingMethod: 'None' | 'RoundUp' | 'RoundDown' | 'NearestRupee';
  /** Absolute ceiling on computed late fee, regardless of formula — closes the "runaway compounding" gap. */
  maximumLateFeeAmount: number | null;
  /** Stop accruing additional late fee once daysLate exceeds this many days. */
  maximumChargingDays: number | null;
  considerAsIncome: boolean;
  allowOnlineCollection: boolean;
  lateFeeIncomeCategoryId?: string | null;
  changeReason?: string | null;
  version?: number;
  isUsedInDownstream?: boolean;
}

export type ICollectionPolicyFormValues = Omit<
  ICollectionPolicy,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'academicYearName'
>;

// ─── Proration Policy ─────────────────────────────────────────────────────────

export type ProrationRuleType =
  'NoProration' | 'DailyProration' | 'MonthlyProration' | 'FullMonthCharge';

export type ProrationCalculationBasis = 'CalendarDays';

export type ProrationRoundOff = 'NoRoundOff' | 'NearestRupee' | 'RoundUp' | 'RoundDown';

export type ProrationMonthlyRule = 'ChargeNextMonth' | 'HalfMonthRule';

export interface IProrationRuleConfiguration {
  // Daily Proration
  calculationBasis?: ProrationCalculationBasis;
  roundOff?: ProrationRoundOff;
  minimumChargeDays?: number | null;

  // Monthly Proration
  monthlyRule?: ProrationMonthlyRule;
  cutOffDay?: number | null; // used by ChargeNextMonth & HalfMonthRule
}

export interface IProrationFeeHeadRule {
  feeHeadId: string;
  feeHeadName?: string;
  feeType: 'Recurring' | 'OneTime'; // stored per rule; displayed read-only
  ruleType: ProrationRuleType;
  configuration: IProrationRuleConfiguration;
  applyOnAdmission?: boolean;
  applyOnEarlyWithdrawal?: boolean;
  earlyWithdrawalRuleType?: ProrationRuleType;
  earlyWithdrawalConfiguration?: IProrationRuleConfiguration;
}

export interface IProrationPolicyRule {
  feeHeadId: string;
  feeHeadName?: string | null;
  ruleType: 'FullCharge' | 'Daily' | 'MonthlyCutoff' | 'FullMonthCharge';
  roundingMode: 'Currency' | 'NearestRupee' | 'RoundUpRupee' | 'RoundDownRupee';
  minimumChargeDays?: number | null;
  cutoffDay?: number | null;
  afterCutoffAction?: 'NoCharge' | 'HalfCharge' | null;
  applyOnAdmission?: boolean;
  applyOnEarlyWithdrawal?: boolean;
  earlyWithdrawalRuleType?: 'FullCharge' | 'Daily' | 'MonthlyCutoff' | 'FullMonthCharge' | null;
  earlyWithdrawalMinimumChargeDays?: number | null;
  earlyWithdrawalCutoffDay?: number | null;
  earlyWithdrawalBeforeCutoffAction?: 'NoCharge' | 'HalfCharge' | null;
}

export interface IProrationPolicy extends Omit<
  IFinancePolicyBase,
  'status' | 'effectiveFrom' | 'effectiveTo'
> {
  policyType: 'proration';
  status: 'Draft' | 'Active' | 'Archived';
  version: number;
  isUsedInDownstream: boolean;
  concurrencyStamp: string;
  creationTime?: string;
  lastModificationTime?: string | null;
  feeHeadRules: IProrationPolicyRule[];
}

export interface IProrationPolicyFormValues {
  policyType: 'proration';
  policyName: string;
  policyCode: string;
  description: string;
  status: 'Draft' | 'Active';
  academicYearId: string;
  isDefault: boolean;
  concurrencyStamp?: string | null;
  changeReason?: string | null;
  feeHeadRules: IProrationFeeHeadRule[];
}
