import type { IFeeStructureSchedulePreview } from 'src/screens/finance/settings/PaymentTerm/type';

import { paymentTermType } from 'src/redux/tagTypes';

import { api } from '../service';

// ── Typed Request/Response DTOs ───────────────────────────────────────────────

export interface PaymentTermListResponse {
  totalCount: number;
  items: PaymentTermListItem[];
}

export interface PaymentTermListItem {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
  boardId: string;
  status: 'Active' | 'Archived';
  isDefault: boolean;
  currentVersionNumber: number;
  installmentCount: number;
  referencedStructureCount: number;
  canDirectEdit: boolean;
}

export interface PaymentTermDetailResponse {
  id: string;
  academicYearId: string;
  boardId: string;
  name: string;
  code: string;
  description?: string;
  status: 'Active' | 'Archived';
  isDefault: boolean;
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';
  demandGenerationRule: 'Immediately' | 'XDaysBeforeDue' | 'OnDueDate' | 'Manual';
  demandOffsetDays?: number | null;
  initialDemandStatus: 'Draft' | 'Published';
  currentVersionId?: string;
  archivedAt?: string;
  totalInstallments: number;
  versionCount: number;
  isUsedInFeeStructures: boolean;
  canDirectEdit: boolean;
  versions: PaymentTermVersionResponse[];
}

export interface PaymentTermVersionResponse {
  id: string;
  versionNumber: number;
  status: 'Draft' | 'Published' | 'Superseded' | 'Archived';
  effectiveFrom?: string;
  effectiveTo?: string;
  publishedAt?: string;
  changeReason?: string;
  installments: PaymentTermInstallmentResponse[];
}

export interface PaymentTermInstallmentResponse {
  id: string;
  sequence: number;
  name: string;
  coverageStartDate: string;
  coverageEndDate: string;
  demandDate: string;
  dueDate: string;
  allocationPercentage: number;
  demandEnabled: boolean;
  reminderEnabled: boolean;
  reminderDate?: string;
  allowPartialOverride?: boolean | null;
  gracePeriodDaysOverride?: number | null;
}

export interface CreatePaymentTermRequest {
  academicYearId: string;
  boardId: string;
  name: string;
  code: string;
  description?: string;
  isDefault: boolean;
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';
  demandGenerationRule: 'Immediately' | 'XDaysBeforeDue' | 'OnDueDate' | 'Manual';
  demandOffsetDays?: number | null;
  initialDemandStatus: 'Draft' | 'Published';
  installments: CreateInstallmentRequest[];
}

export interface CreateInstallmentRequest {
  sequence: number;
  name: string;
  coverageStartDate: string;
  coverageEndDate: string;
  demandDate: string;
  dueDate: string;
  allocationPercentage: number;
  demandEnabled: boolean;
  reminderEnabled: boolean;
  reminderDate?: string;
  allowPartialOverride?: boolean | null;
  gracePeriodDaysOverride?: number | null;
}

export interface UpdatePaymentTermDraftRequest {
  name: string;
  code: string;
  description?: string;
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';
  demandGenerationRule: 'Immediately' | 'XDaysBeforeDue' | 'OnDueDate' | 'Manual';
  demandOffsetDays?: number | null;
  initialDemandStatus: 'Draft' | 'Published';
  installments: CreateInstallmentRequest[];
}

export interface CreateRevisionRequest {
  changeReason: string;
  sourceVersionId?: string;
}

export interface PublishVersionRequest {
  effectiveFrom: string;
}

export interface PublishResultResponse {
  versionId: string;
  versionNumber: number;
  validationWarnings: string[];
  impactPreview?: ImpactPreviewResponse;
}

export interface ImpactPreviewResponse {
  affectedStructures: number;
  affectedStudents: number;
  existingIssuedDueCount: number;
  futureUngeneratedInstanceCount: number;
  projectedTotalAmount: number;
  structures: ImpactPreviewStructureResponse[];
}

export interface ImpactPreviewStructureResponse {
  feeStructureId: string;
  feeStructureName: string;
  studentCount: number;
  issuedDueCount: number;
  futureInstanceCount: number;
  projectedAmount: number;
}

export interface ClonePaymentTermsRequest {
  sourceAcademicYearId: string;
  targetAcademicYearId: string;
  paymentTermIds: string[];
}

export interface ClonePaymentTermsResult {
  clonedTermIds: string[];
  conflictedCodes: string[];
  dateRangesRequiringReview: string[];
}

export interface ArchivePaymentTermRequest {
  reason: string;
}

export interface PaymentTermListParams {
  academicYearId: string;
  boardId?: string;
  status?: 'Active' | 'Archived';
  search?: string;
  includeArchived?: boolean;
  page?: number;
  pageSize?: number;
}

// ── RTK Query API ─────────────────────────────────────────────────────────────

export const PaymentTermApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── List ────────────────────────────────────────────────────────────────
    getPaymentTerms: builder.query<PaymentTermListResponse, PaymentTermListParams>({
      query: (params) => ({
        url: '/finance/payment-terms',
        method: 'GET',
        params: {
          academicYearId: params.academicYearId,
          boardId: params.boardId,
          status: params.status,
          search: params.search,
          includeArchived: params.includeArchived,
          skipCount: params.page ? (params.page - 1) * (params.pageSize ?? 10) : 0,
          maxResultCount: params.pageSize ?? 10,
        },
      }),
      providesTags: [paymentTermType.paymentTerm],
    }),

    // ── Detail ──────────────────────────────────────────────────────────────
    getPaymentTermById: builder.query<PaymentTermDetailResponse, string>({
      query: (paymentTermId) => ({
        url: `/finance/payment-terms/${paymentTermId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: paymentTermType.paymentTerm, id }],
    }),

    // ── Create ──────────────────────────────────────────────────────────────
    createPaymentTerm: builder.mutation<PaymentTermDetailResponse, CreatePaymentTermRequest>({
      query: (body) => ({
        url: '/finance/payment-terms',
        method: 'POST',
        body,
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),

    // ── Update Draft ────────────────────────────────────────────────────────
    updatePaymentTermDraft: builder.mutation<
      PaymentTermDetailResponse,
      { paymentTermId: string; body: UpdatePaymentTermDraftRequest }
    >({
      query: ({ paymentTermId, body }) => ({
        url: `/finance/payment-terms/${paymentTermId}/draft`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { paymentTermId }) => [
        paymentTermType.paymentTerm,
        { type: paymentTermType.paymentTerm, id: paymentTermId },
      ],
    }),

    // ── Delete ──────────────────────────────────────────────────────────────
    deletePaymentTerm: builder.mutation<void, string>({
      query: (paymentTermId) => ({
        url: `/finance/payment-terms/${paymentTermId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),

    // ── Create Revision ─────────────────────────────────────────────────────
    createRevision: builder.mutation<
      PaymentTermDetailResponse,
      { paymentTermId: string; body: CreateRevisionRequest }
    >({
      query: ({ paymentTermId, body }) => ({
        url: `/finance/payment-terms/${paymentTermId}/revisions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { paymentTermId }) => [
        paymentTermType.paymentTerm,
        { type: paymentTermType.paymentTerm, id: paymentTermId },
      ],
    }),

    // ── Publish Version ─────────────────────────────────────────────────────
    publishVersion: builder.mutation<
      PublishResultResponse,
      { paymentTermId: string; versionId: string; body: PublishVersionRequest }
    >({
      query: ({ paymentTermId, versionId, body }) => ({
        url: `/finance/payment-terms/${paymentTermId}/versions/${versionId}/publish`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { paymentTermId }) => [
        paymentTermType.paymentTerm,
        { type: paymentTermType.paymentTerm, id: paymentTermId },
      ],
    }),

    // ── Archive ─────────────────────────────────────────────────────────────
    archivePaymentTerm: builder.mutation<
      void,
      { paymentTermId: string; body: ArchivePaymentTermRequest }
    >({
      query: ({ paymentTermId, body }) => ({
        url: `/finance/payment-terms/${paymentTermId}/archive`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),

    // ── Restore ─────────────────────────────────────────────────────────────
    restorePaymentTerm: builder.mutation<PaymentTermDetailResponse, string>({
      query: (paymentTermId) => ({
        url: `/finance/payment-terms/${paymentTermId}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),

    // ── Clone ───────────────────────────────────────────────────────────────
    clonePaymentTerms: builder.mutation<ClonePaymentTermsResult, ClonePaymentTermsRequest>({
      query: (body) => ({
        url: '/finance/payment-terms/clone',
        method: 'POST',
        body,
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),

    // ── Impact Preview ──────────────────────────────────────────────────────
    getImpactPreview: builder.query<ImpactPreviewResponse, string>({
      query: (paymentTermId) => ({
        url: `/finance/payment-terms/${paymentTermId}/impact-preview`,
        method: 'GET',
      }),
    }),

    // ── Fee Structure Schedule Preview ──────────────────────────────────────
    getFeeStructureSchedulePreview: builder.query<IFeeStructureSchedulePreview, string>({
      query: (feeStructureId) => ({
        url: `/finance/payment-terms/fee-structure-schedule-preview/${feeStructureId}`,
        method: 'GET',
      }),
    }),
  }),
});

// ── Backward-compatible hook exports ──────────────────────────────────────────
// Kept old hook names for gradual migration; new typed hooks available below.

export const {
  useGetPaymentTermsQuery,
  useLazyGetPaymentTermsQuery,
  useGetPaymentTermByIdQuery,
  useLazyGetPaymentTermByIdQuery,
  useCreatePaymentTermMutation,
  useUpdatePaymentTermDraftMutation,
  useDeletePaymentTermMutation,
  useCreateRevisionMutation,
  usePublishVersionMutation,
  useArchivePaymentTermMutation,
  useRestorePaymentTermMutation,
  useClonePaymentTermsMutation,
  useGetImpactPreviewQuery,
  useGetFeeStructureSchedulePreviewQuery,
} = PaymentTermApi;
