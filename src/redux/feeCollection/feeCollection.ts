import type { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../finance/financeModuleApi';

export const FEE_COLLECTION_V2_BASE_URL = '/fee-collections';
export const FEE_RECEIPT_BASE_URL = '/v1/fee-receipts';
export const CHARGE_RECEIPT_BASE_URL = '/v1/charge-receipts';

// ─── Generic Receipt PDF download helper ──────────────────────────────────
export const downloadReceiptPdfConfig = {
  fee: { baseUrl: FEE_RECEIPT_BASE_URL, label: 'Fee Receipt' },
  charge: { baseUrl: CHARGE_RECEIPT_BASE_URL, label: 'Charge Receipt' },
} as const;

type StudentIdArg = string | { studentId: string };

function resolveStudentId(arg: StudentIdArg | undefined): string {
  const studentId = typeof arg === 'string' ? arg : arg?.studentId;
  if (!studentId) throw new Error('Student id is required');
  return studentId;
}

export function buildFeeCollectionCollectFormUrl(arg: StudentIdArg | undefined): string {
  return `${FEE_COLLECTION_V2_BASE_URL}/${resolveStudentId(arg)}/collect-form`;
}

export function buildFeeCollectionStudentFeeDetailsUrl(arg: StudentIdArg | undefined): string {
  return `${FEE_COLLECTION_V2_BASE_URL}/${resolveStudentId(arg)}/fee-details`;
}

// ─── V2 DTO Types (mirroring backend contracts) ──────────────────────────────

export interface FeeCollectionSummaryItem {
  studentId: string;
  studentName: string;
  grNumber: string;
  rollNumber: string;
  standardDivision: string;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  overdueFees: number;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export interface FeeCollectionSummaryParams {
  academicYearId: string;
  boardId: string;
  educationMediumId: string;
  standardId?: string;
  divisionId?: string;
  search?: string;
  status?: number;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

// ─── Collect-form types ───────────────────────────────────────────────────────

export interface StudentInfo {
  studentId: string;
  studentName: string;
  grNo: string;
  rollNo: string;
  boardId: string;
  boardName: string;
  educationMediumId: string;
  educationMediumName: string;
  standardId: string;
  standardName: string;
  divisionId: string;
  divisionName: string;
  contactNo: string;
  email: string;
  feeStructureName: string;
  isFeeStructureAssigned: boolean;
}

export interface FeeSummary {
  totalFee: number;
  paidFee: number;
  pendingFee: number;
}

export interface FeeLedgerLine {
  dueFeeId: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel?: string;
  dueDate?: string;
  coverageStartDate?: string;
  coverageEndDate?: string;
  scheduleSource?: 'PaymentTerm' | 'Legacy' | string;
  total: number;
  scheduledTotal?: number;
  prorationPolicyId?: string | null;
  prorationPolicyVersionId?: string | null;
  prorationFactor?: number | null;
  prorationRuleType?: string | null;
  prorationRoundingMode?: string | null;
  prorationEligibleStartDate?: string | null;
  prorationEligibleEndDate?: string | null;
  prorationCoverageDays?: number | null;
  prorationEligibleDays?: number | null;
  prorationChargedDays?: number | null;
  prorationExplanation?: string | null;
  paid: number;
  due: number;
  status: number | string;
  reconciliationAmount?: number;
  concessionAmount?: number;
  refundAmount?: number;
  refundDescription?: string;
  /** Computed via LateFeeCalculationService, net of any applied waiver. Zero when no policy resolves, the student is exempt, or the line isn't overdue. */
  lateFeeAmount?: number;
  /** One-line breakdown, e.g. "₹20/day × 15 days late = ₹300". Empty when lateFeeAmount is 0. */
  lateFeeExplanation?: string;
  /** Sum of Applied waivers already granted against this line's late fee. */
  lateFeeWaivedAmount?: number;
}

export interface FeeLedgerMonth {
  month: FeeMonth;
  year: number;
  totalDue: number;
  items: FeeLedgerLine[];
}

export interface ChargeDetail {
  chargeId: string;
  name: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  reconciliationAmount?: number;
  status: number | string;
}

export interface FeeCollectFormDto {
  student: StudentInfo;
  summary: FeeSummary;
  ledger: FeeLedgerMonth[];
  charges: ChargeDetail[];
  /** Resolved from the student's Collection Policy — true (default) when no policy resolves. */
  allowOnlineCollection: boolean;
}

// ─── Fee-details types ────────────────────────────────────────────────────────

export interface StudentSummary {
  id: string;
  name: string;
  standardName: string;
  divisionName: string;
  rollNo: string;
  mobileNo?: string;
}

export interface FeeOverview {
  totalFee: number;
  paidFee: number;
  pendingFee: number;
  concessionAmount?: number;
}

export interface FeeHeadSummary {
  feeHeadId: string;
  feeHeadName: string;
  amount: number;
  paidAmount: number;
  pendingAmount?: number;
  description: string;
  status: FeeCollectionStatusType;
}

export interface FeeChargeDetail {
  chargeId: string;
  name: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: FeeCollectionStatusType;
}

export interface PaymentHistoryItem {
  paymentId: string;
  receiptNumber: string;
  date: string;
  amount: number;
  paymentMethods: string[];
  receiptUrl?: string;
}

export interface ConcessionDetail {
  concessionRequestConcessionTypeId: string;
  concessionTypeName: string;
  amount?: number;
}

export interface StudentFeeDetailsDto {
  student: StudentSummary;
  feeOverview: FeeOverview;
  feeHeads: FeeHeadSummary[];
  charges?: FeeChargeDetail[];
  payments?: PaymentHistoryItem[];
  concessions?: ConcessionDetail[];
}

// ─── Collect fee input types ──────────────────────────────────────────────────

export interface DueFeePayment {
  dueFeeId: string;
  feeHeadId: string;
  amount: number;
}

export interface ChargePayment {
  chargeId: string;
  amount: number;
}

export interface LateFeePayment {
  dueFeeId: string;
  amount: number;
}

export interface FeePayment {
  paymentMethod: string | number;
  amount: number;
  details?: Record<string, unknown>;
}

export interface CollectFeeInput {
  studentId: string;
  academicYearId: string;
  notes?: string;
  paymentConfirmed?: boolean;
  dueFeePayments: DueFeePayment[];
  chargePayments: ChargePayment[];
  /** Late fee amount being collected per due line. Optional — omit or send an empty array for a fee-only collection. */
  lateFeePayments?: LateFeePayment[];
  payments: FeePayment[];
}

export interface FinanceAuditAllocationLine {
  dueFeeId: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  amountPaid: number;
  pendingBefore: number;
  pendingAfter: number;
}

export interface FinanceAuditChangedField {
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
}

export interface FinanceAuditSummary {
  headline: string;
  totalAmount: number;
  changedFields: FinanceAuditChangedField[];
  allocationLines: FinanceAuditAllocationLine[];
}

export interface CollectFeeOutput {
  id: string;
  receiptNumber: string;
  feeReceiptNumber?: string;
  feeReceiptId?: string;
  chargeReceiptNumber?: string;
  chargeReceiptId?: string;
  studentId: string;
  studentName: string;
  academicYearId: string;
  totalAmount: number;
  status: number;
  collectedBy: string;
  collectedAt: string;
  createdAt: string;
  receiptUrl?: string;
  paidFeeHeads: { feeHeadId: string; feeHeadName: string; amountPaid: number }[];
  paidCharges?: { chargeId: string; chargeName: string; amountPaid: number }[];
  receivedAmount: number;
  paidDueFees: { dueFeeId: string; feeHeadId: string; amountPaid: number }[];
  /** Late fee amounts collected per due line in this transaction (empty when none). */
  paidLateFees?: { dueFeeId: string; feeHeadId: string; amountPaid: number }[];
  correlationId?: string;
  auditEventIds?: string[];
  auditSummary?: FinanceAuditSummary;
}

// ─── Receipt Detail Types ────────────────────────────────────────────────────

export interface FeeReceiptDetail {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  academicYearId: string;
  totalAmount: number;
  collectedAt: string;
  collectedBy: string;
  paidFeeHeads: Array<{
    feeHeadId: string;
    feeHeadName: string;
    amountPaid: number;
  }>;
  allocationDetails?: Array<{
    feeHeadId: string;
    feeHeadName: string;
    installmentLabel: string;
    pendingBefore: number;
    amountPaid: number;
    pendingAfter: number;
  }>;
  auditSummary?: FinanceAuditSummary;
}

export interface ChargeReceiptDetail {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  academicYearId: string;
  totalAmount: number;
  collectedAt: string;
  collectedBy: string;
  paidCharges: Array<{
    chargeId: string;
    chargeName: string;
    amountPaid: number;
  }>;
  auditSummary?: FinanceAuditSummary;
}

// ─── RTK Query slice ──────────────────────────────────────────────────────────

export const feeCollectionApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /v2/fee-collections
     * Server-side paginated summary of students with fee status.
     */
    getFeeCollectionList: builder.query<
      PagedResult<FeeCollectionSummaryItem>,
      FeeCollectionSummaryParams
    >({
      query: (params) => ({
        url: FEE_COLLECTION_V2_BASE_URL,
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeCollection],
    }),

    /**
     * GET /v2/fee-collections/{studentId}/collect-form?academicYearId=
     * Returns the student context, month-wise DueFee ledger, and approved charges
     * needed to populate the collect-fee dialog.
     */
    getCollectForm: builder.query<FeeCollectFormDto, { studentId: string; academicYearId: string }>(
      {
        query: ({ studentId, academicYearId }) => ({
          url: buildFeeCollectionCollectFormUrl(studentId),
          method: 'GET',
          params: { academicYearId },
        }),
        providesTags: [financeModuleType.feeCollection],
      }
    ),

    /**
     * GET /v2/fee-collections/{studentId}/fee-details?academicYearId=
     * Returns complete fee info: breakdown, payment history, concessions.
     */
    getStudentFeeDetails: builder.query<
      StudentFeeDetailsDto,
      { studentId: string; academicYearId: string }
    >({
      query: ({ studentId, academicYearId }) => ({
        url: buildFeeCollectionStudentFeeDetailsUrl(studentId),
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [financeModuleType.feeDetails],
    }),

    /**
     * POST /v2/fee-collections
     * Records a fee payment with support for multiple payment methods and DueFee allocations.
     */
    collectFee: builder.mutation<CollectFeeOutput, CollectFeeInput>({
      query: (body) => ({
        url: FEE_COLLECTION_V2_BASE_URL,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.feeCollection,
        financeModuleType.feeDetails,
        financeModuleType.financeAudit,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),

    /**
     * Generic receipt PDF download for both fee and charge receipts
     * GET /v1/fee-receipts/{id}/pdf or /v1/charge-receipts/{id}/pdf
     * Returns receipt PDF as Blob for authenticated preview/download.
     */
    downloadReceiptPdf: builder.mutation<Blob, { receiptId: string }>({
      query: ({ receiptId }) => ({
        url: `${FEE_RECEIPT_BASE_URL}/${receiptId}/pdf`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFeeCollectionListQuery,
  useGetCollectFormQuery,
  useGetStudentFeeDetailsQuery,
  useCollectFeeMutation,
  useDownloadReceiptPdfMutation,
} = feeCollectionApi;
