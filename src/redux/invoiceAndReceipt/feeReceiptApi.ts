import { receiptType } from '../tagTypes';
import { financeModuleApi } from '../finance/financeModuleApi';

export const FEE_RECEIPT_BASE_URL = '/v1/fee-receipts';

// ─── Enum mirrors (match backend values) ─────────────────────────────────────

export enum FeeReceiptKind {
  FinalFee = 1,
  ProvisionalFee = 2,
  ProvisionalCharge = 3,
  FinalCharge = 4,
}

export enum FeeReceiptVerificationStatus {
  NotApplicable,
  PendingVerification,
  Verified,
  Rejected,
}

export enum FeeReceiptScope {
  Fee = 1,
  Charge = 2,
  Combined = 3,
}

// ─── Label helpers ────────────────────────────────────────────────────────────

export const FEE_RECEIPT_KIND_LABELS: Record<FeeReceiptKind, string> = {
  [FeeReceiptKind.FinalFee]: 'Receipt (Fee)',
  [FeeReceiptKind.FinalCharge]: 'Receipt (Charge)',
  [FeeReceiptKind.ProvisionalFee]: 'Provisional Receipt (Fee)',
  [FeeReceiptKind.ProvisionalCharge]: 'Provisional Receipt (Charge)',
};

export type ReceiptKindColor = 'success' | 'warning' | 'info' | 'default';

export const FEE_RECEIPT_KIND_COLORS: Record<FeeReceiptKind, ReceiptKindColor> = {
  [FeeReceiptKind.FinalFee]: 'success',
  [FeeReceiptKind.FinalCharge]: 'success',
  [FeeReceiptKind.ProvisionalFee]: 'warning',
  [FeeReceiptKind.ProvisionalCharge]: 'info',
};

export const FEE_RECEIPT_VERIFICATION_LABELS: Record<FeeReceiptVerificationStatus, string> = {
  [FeeReceiptVerificationStatus.NotApplicable]: '',
  [FeeReceiptVerificationStatus.PendingVerification]: 'Pending',
  [FeeReceiptVerificationStatus.Verified]: 'Verified',
  [FeeReceiptVerificationStatus.Rejected]: 'Rejected',
};

// ─── DTO types ────────────────────────────────────────────────────────────────

export interface FeeReceiptListItem {
  id: string;
  receiptNumber: string;
  receiptKind: FeeReceiptKind;
  receiptKindLabel: string;
  paymentMethodLabel?: string;
  pdfFileName?: string;
  receiptScope: FeeReceiptScope;
  verificationStatus: FeeReceiptVerificationStatus;
  linkedFinalReceiptNumber: string | null;
  totalPaidAmount: number;
  studentId: string;
  studentName: string;
  grNo: number | null;
  rollNo: string | null;
  receiptDate: string;
  creationTime: string;
  hasPdf: boolean;
  feeCollectionTransactionId: string;
}

export interface FeeReceiptDetail extends FeeReceiptListItem {
  feePaidAmount?: number;
  chargePaidAmount?: number;
  linkedProvisionalReceiptId: string | null;
  linkedProvisionalReceiptNumber: string | null;
  linkedFinalReceiptId: string | null;
  academicYearId: string;
  boardId: string;
  educationMediumId: string;
  academicYearName: string | null;
  boardName: string | null;
  mediumName: string | null;
  className: string | null;
  division: string | null;
  siblingReceiptNumber: string | null;
  remarks: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export interface GetFeeReceiptListParams {
  academicYearId: string;
  boardId: string;
  educationMediumId: string;
  standardId?: string;
  divisionId?: string;
  /** Calendar month (1–12); omitted means all months in the academic year. */
  month?: number;
  receiptKind?: FeeReceiptKind;
  search?: string;
  /** Serialized Finance table column criteria. */
  filters?: string;
  skipCount?: number;
  maxResultCount?: number;
}

// ─── RTK Query slice ──────────────────────────────────────────────────────────

export const feeReceiptApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /v1/fee-receipts
     * Server-side paginated list with Board + Medium required; Month and ReceiptKind optional.
     */
    getFeeReceiptList: builder.query<PagedResult<FeeReceiptListItem>, GetFeeReceiptListParams>({
      query: (params) => ({
        url: FEE_RECEIPT_BASE_URL,
        method: 'GET',
        params,
      }),
      providesTags: [receiptType.receipt],
    }),

    /**
     * GET /v1/fee-receipts/{id}
     * Full receipt detail with sibling correlation and kachi↔final linkage.
     */
    getFeeReceiptDetail: builder.query<FeeReceiptDetail, { id: string }>({
      query: ({ id }) => ({
        url: `${FEE_RECEIPT_BASE_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { id }) => [{ type: receiptType.receipt, id }],
    }),

    /**
     * GET /v1/fee-receipts/{id}/pdf
     * Returns the PDF blob URL for inline preview / download.
     * The response is a binary PDF, so this is used via a direct <a> link or
     * window.open in the preview dialog; this endpoint returns the blob URL.
     */
    getFeeReceiptPdfUrl: builder.query<string, string>({
      queryFn: (id) => ({ data: `${FEE_RECEIPT_BASE_URL}/${id}/pdf` }),
    }),
  }),
});

export const {
  useGetFeeReceiptListQuery,
  useGetFeeReceiptDetailQuery,
  useGetFeeReceiptPdfUrlQuery,
} = feeReceiptApi;
