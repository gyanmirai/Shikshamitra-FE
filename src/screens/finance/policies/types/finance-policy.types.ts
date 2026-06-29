// ─── Enums & Union Types ───────────────────────────────────────────────────────

export type FinancePolicyKind =
  | 'payment'
  | 'late-fee'
  | 'concession'
  | 'refund'
  | 'collection'
  | 'proration';

export type FinancePolicyStatus = 'Active' | 'Inactive' | 'Draft' | 'Published' | 'Archived';

export type AllocationMethod = 'FeeHeadPriority' | 'Proportional' | 'FIFO' | 'Manual';

export type MinPaymentType = 'FixedAmount' | 'Percentage' | 'InstallmentAmount';

export type ReceiptGenerationMode = 'Immediate' | 'OnApproval' | 'OnSettlement';

export type LateFeeCalculationType =
  | 'FlatAmount'
  | 'Percentage'
  | 'PerDay'
  | 'PerWeek'
  | 'PerMonth';

export type ConcessionDiscountType = 'Percentage' | 'FlatAmount';

export type ConcessionEligibilityType =
  | 'Sibling'
  | 'Staff'
  | 'MeritBased'
  | 'NeedBased'
  | 'GovernmentScheme'
  | 'Custom';

export type ConcessionCalculationMethod = 'Percentage' | 'FixedAmount' | 'FullWaiver' | 'Manual';
export type ConcessionCalculationBase = 'OriginalFee' | 'OutstandingAmount' | 'FeeHeadAmount';
export type ConcessionRoundOff = 'None' | 'RoundUp' | 'RoundDown' | 'NearestRupee';
export type ConcessionApplyOn =
  | 'PendingFeesOnly'
  | 'PaidFeesOnly'
  | 'PaidAndPending'
  | 'FutureInstallmentsOnly'
  | 'CurrentInstallmentOnly'
  | 'EntireFeeStructure';
export type ConcessionPaidFeeAdjustment =
  | 'Refund'
  | 'CreditNote'
  | 'StudentWallet'
  | 'FutureFeeAdjustment'
  | 'ManualDecision';
export type ConcessionPendingFeeHandling =
  | 'ReduceOutstanding'
  | 'RecalculateInstallments'
  | 'FutureInstallmentsOnly';
export type ConcessionFutureInstallmentStrategy =
  | 'EqualDistribution'
  | 'RemainingInstallments'
  | 'CurrentInstallment';
export type ConcessionExistingDemand =
  | 'RecalculateAutomatically'
  | 'RecalculateFutureOnly'
  | 'ManualRecalculation'
  | 'KeepExisting';
export type ConcessionReceiptBehaviour =
  | 'KeepOriginalReceipt'
  | 'GenerateAdjustmentReceipt'
  | 'ReverseOriginalReceipt';
export type ConcessionLateFeeBehaviour = 'Recalculate' | 'KeepExisting' | 'RemoveLateFee';
export type ConcessionDemandStatus = 'UpdateImmediately' | 'UpdateAfterApproval';
export type ConcessionExpiry = 'Never' | 'SessionEnd' | 'FixedDate';
export type ConcessionRenewal = 'Manual' | 'Automatic' | 'ReapprovalRequired';
export type ConcessionApplyOn_FeeHeads = 'EntireFeeStructure' | 'SelectedFeeHeads';

export type RefundMethod = 'BankTransfer' | 'Cash' | 'Cheque' | 'OnlineGateway';

// ─── Common fields shared by all policy types ─────────────────────────────────

export interface IFinancePolicyBase {
  id?: string;
  policyName: string;
  policyCode: string;
  description: string;
  status: FinancePolicyStatus;
  academicYearId: string;
  academicYearName?: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isDefault: boolean;
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

// ─── Late Fee Policy ──────────────────────────────────────────────────────────

export interface ILateFeeEscalationRule {
  startDay: number;
  endDay: number | null;
  calculationType: 'Flat' | 'Percentage';
  value: number;
  maxFee?: number | null;
  roundOff?: string;
}

export interface ILateFeePolicy extends IFinancePolicyBase {
  policyType: 'late-fee';
  priority?: number;
  gracePeriodDays: number;
  gracePeriodType: 'Calendar' | 'Working';
  calculationType: LateFeeCalculationType;
  calculationValue: number;

  // calculation configuration
  lateFeeType?: 'Flat' | 'Percentage' | 'Compound' | 'Slab';
  flatAmount?: number | null;
  percentage?: number | null;
  percentageBase?: 'OutstandingAmount' | 'OriginalAmount';
  compoundFrequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  escalationEnabled?: boolean;

  // Maximum limits
  maximumLateFeeAmount: number | null;
  maximumLateFeePercentage: number | null;
  compoundLateFee: boolean;
  roundOffMethod?: 'None' | 'Nearest' | 'RoundUp' | 'RoundDown';
  minimumCharge?: number | null;
  maximumCharge?: number | null;

  // Charge generation
  willCreateCharge?: boolean;
  autoCalculate: boolean;
  separateChargeEntry?: boolean;
  chargeCategoryId?: string;
  chargeHeadId?: string;
  ledgerMappingId?: string;
  showOnReceipt?: boolean;
  showInParentPortal?: boolean;

  // Waiver rules
  waiveOnApproval: boolean;
  waiveRoleIds: string[];
  waiverAllowed?: boolean;
  maximumWaiverPercentage?: number | null;
  approvalRequired?: boolean;
  reasonMandatory?: boolean;

  // Escalation Slabs
  escalationRules: ILateFeeEscalationRule[];
  applyOnFeeHeads: string[];
}

export type ILateFeePolicyFormValues = Omit<
  ILateFeePolicy,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'academicYearName'
>;

// ─── Concession Policy ────────────────────────────────────────────────────────

export interface IConcessionDiscountRule {
  feeHeadId: string;
  feeHeadName?: string;
  discountType: ConcessionDiscountType;
  discountValue: number;
}

export interface IConcessionPolicy extends IFinancePolicyBase {
  policyType: 'concession';

  // Card 1 – General Information
  concessionType: string;

  // Card 2 – Calculation Rules
  calculationMethod: ConcessionCalculationMethod;
  percentageValue: number | null;
  fixedAmount: number | null;
  calculationBase: ConcessionCalculationBase;
  roundOff: ConcessionRoundOff;
  minimumConcession: number | null;

  // Card 3 – Applicable Fee Heads
  feeHeadScope: ConcessionApplyOn_FeeHeads;
  applicableFeeHeads: string[];

  // Card 4 – Application Behaviour
  applyOn: ConcessionApplyOn;
  paidFeeAdjustment: ConcessionPaidFeeAdjustment | null;
  pendingFeeHandling: ConcessionPendingFeeHandling | null;
  futureInstallmentStrategy: ConcessionFutureInstallmentStrategy | null;

  // Card 5 – Demand Behaviour
  existingDemand: ConcessionExistingDemand;
  receiptBehaviour: ConcessionReceiptBehaviour;
  lateFeeBehaviour: ConcessionLateFeeBehaviour;
  demandStatus: ConcessionDemandStatus;

  // Card 6 – Approval Workflow
  requireApproval: boolean;
  approvalLevels: string[];
  minimumApprovalCount: number | null;
  reasonMandatory: boolean;
  supportingDocumentsRequired: boolean;
  requiredDocumentTypes: string[];

  // Legacy / backward-compat
  eligibilityType: ConcessionEligibilityType;
  eligibilityCriteria: string;
  discountType: ConcessionDiscountType;
  discountValue: number;
  discountRules: IConcessionDiscountRule[];
  approvalRoleIds: string[];
  allowStacking: boolean;
  maximumStackingCount: number | null;
  governmentSchemeCode: string;
  governmentSchemeDetails: string;
  validFrom: string | null;
  validTo: string | null;
}

export type IConcessionPolicyFormValues = Omit<
  IConcessionPolicy,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'academicYearName'
>;

// ─── Refund Policy ────────────────────────────────────────────────────────────

export interface IRefundDeductionRule {
  afterDays: number;
  deductionType: 'Percentage' | 'FlatAmount';
  deductionValue: number;
  description: string;
}

export interface IRefundPolicy extends IFinancePolicyBase {
  policyType: 'refund';
  refundMethod?: RefundMethod;
  processingDays?: number;
  allowPartialRefund?: boolean;
  requireApproval?: boolean;
  approvalRoleIds?: string[];
  deductionRules: IRefundDeductionRule[];
  maxRefundPercentage?: number | null;
  maxRefundAmount?: number | null;
  refundOnWithdrawal?: boolean;
  refundOnTransfer?: boolean;
  governmentComplianceCode?: string;
  bankDetailsRequired: boolean;
  cancellationNoticeDays?: number | null;
  applicableFeeHeads: string[];

  // New Fields
  refundOn?: 'FullPayment' | 'PartialAndFullPayment';
  enableRefundForCharge?: boolean;
  considerAsExpense?: boolean;
  refundDueWithin?: number;
}

export type IRefundPolicyFormValues = Omit<
  IRefundPolicy,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'academicYearName'
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
}

// ─── Collection Policy ────────────────────────────────────────────────────────
export interface ICollectionPolicy extends IFinancePolicyBase {
  policyType: 'collection';
  status: 'Active' | 'Archived';
  enableLateFee: boolean;
  gracePeriodDays: number;
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
  roundingMethod: 'None' | 'RoundUp' | 'RoundDown' | 'NearestRupee';
  considerAsIncome: boolean;
  enableWaiver: boolean;
  waiverApplyOnFeeHeads: string[];
  maximumWaiverAmount: number | null;
  maximumWaiverPercentage: number | null;
  waiverExpiry: string | null;
  allowOnlineCollection: boolean;
}

export type ICollectionPolicyFormValues = Omit<
  ICollectionPolicy,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'academicYearName'
>;

// ─── Proration Policy ─────────────────────────────────────────────────────────

export type ProrationRuleType =
  | 'NoProration'
  | 'DailyProration'
  | 'MonthlyProration'
  | 'FullMonthCharge';

export type ProrationCalculationBasis = 'CalendarDays';

export type ProrationRoundOff = 'NoRoundOff' | 'NearestRupee' | 'RoundUp' | 'RoundDown';

export type ProrationMonthlyRule = 'ChargeCurrentMonth' | 'ChargeNextMonth' | 'HalfMonthRule';

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
  prorationApplicable: boolean;
  ruleType: ProrationRuleType | null;
  configuration: IProrationRuleConfiguration;
}

export interface IProrationPolicy extends IFinancePolicyBase {
  policyType: 'proration';
  feeHeadRules: IProrationFeeHeadRule[];
}

export type IProrationPolicyFormValues = Omit<
  IProrationPolicy,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'academicYearName'
>;
