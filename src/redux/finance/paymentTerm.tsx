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
  status: 'Draft' | 'Active' | 'Archived';
  isDefault: boolean;
  currentVersionNumber: number;
  hasDraft: boolean;
  hasPublishedVersion: boolean;
  installmentCount: number;
  referencedStructureCount: number;
  canDirectEdit: boolean;
}

export interface PaymentTermDetailResponse {
  id: string;
  academicYearId: string;
  academicYearName?: string;
  boardId: string;
  boardName?: string;
  name: string;
  code: string;
  description?: string;
  status: 'Draft' | 'Active' | 'Archived';
  isDefault: boolean;
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';
  demandGenerationRule: 'OnInstallmentStartDate' | 'XDaysBeforeDue' | 'OnDueDate' | 'SpecificDate';
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
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';
  demandGenerationRule: 'OnInstallmentStartDate' | 'XDaysBeforeDue' | 'OnDueDate' | 'SpecificDate';
  demandOffsetDays?: number | null;
  effectiveFrom?: string;
  effectiveTo?: string;
  publishedAt?: string;
  changeReason?: string;
  installments: PaymentTermInstallmentResponse[];
}

export interface PaymentTermVersionHistoryResponse {
  totalCount: number;
  items: PaymentTermVersionHistoryItem[];
}

export interface PaymentTermVersionHistoryItem {
  id: string;
  versionNumber: number;
  status: PaymentTermVersionResponse['status'];
  changeAction: string;
  changeReason?: string | null;
  creationTime: string;
  creatorId?: string | null;
  createdByName?: string | null;
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
  status: 'Draft' | 'Active';
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';
  demandGenerationRule: 'OnInstallmentStartDate' | 'XDaysBeforeDue' | 'OnDueDate' | 'SpecificDate';
  demandOffsetDays?: number | null;
  installments: CreateInstallmentRequest[];
}

export interface CreateInstallmentRequest {
  sequence: number;
  name: string;
  coverageStartDate: string;
  coverageEndDate: string;
  demandDate?: string;
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
  isDefault: boolean;
  status: 'Draft' | 'Active';
  holidayShiftingMethod: 'None' | 'NextWorkingDay' | 'PreviousWorkingDay';
  demandGenerationRule: 'OnInstallmentStartDate' | 'XDaysBeforeDue' | 'OnDueDate' | 'SpecificDate';
  demandOffsetDays?: number | null;
  installments: CreateInstallmentRequest[];
}

export interface CreateRevisionRequest {
  changeReason: string;
  sourceVersionId?: string;
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

// Older API versions serialize enums as numeric values, while this UI uses
// descriptive strings. Normalize both wire formats once at this boundary so
// controls and derived values never need to understand both formats.
type WireEnum<T extends string> = T | number;

type PaymentTermListItemWireResponse = Omit<PaymentTermListItem, 'status'> & {
  status: WireEnum<PaymentTermListItem['status']>;
};

export type PaymentTermListWireResponse = Omit<PaymentTermListResponse, 'items'> & {
  items: PaymentTermListItemWireResponse[];
};

type PaymentTermVersionWireResponse = Omit<
  PaymentTermVersionResponse,
  'status' | 'holidayShiftingMethod' | 'demandGenerationRule'
> & {
  status: WireEnum<PaymentTermVersionResponse['status']>;
  holidayShiftingMethod: WireEnum<PaymentTermVersionResponse['holidayShiftingMethod']>;
  demandGenerationRule: WireEnum<PaymentTermVersionResponse['demandGenerationRule']>;
};

export type PaymentTermVersionHistoryWireResponse = Omit<
  PaymentTermVersionHistoryResponse,
  'items'
> & {
  items: Array<
    Omit<PaymentTermVersionHistoryItem, 'status'> & {
      status: WireEnum<PaymentTermVersionHistoryItem['status']>;
    }
  >;
};

export type PaymentTermDetailWireResponse = Omit<
  PaymentTermDetailResponse,
  'status' | 'holidayShiftingMethod' | 'demandGenerationRule' | 'initialDemandStatus' | 'versions'
> & {
  status: WireEnum<PaymentTermDetailResponse['status']>;
  holidayShiftingMethod: WireEnum<PaymentTermDetailResponse['holidayShiftingMethod']>;
  demandGenerationRule: WireEnum<PaymentTermDetailResponse['demandGenerationRule']>;
  initialDemandStatus: WireEnum<PaymentTermDetailResponse['initialDemandStatus']>;
  versions: PaymentTermVersionWireResponse[];
};

const PAYMENT_TERM_STATUSES = ['Draft', 'Active', 'Archived'] as const;
const PAYMENT_TERM_VERSION_STATUSES = ['Draft', 'Published', 'Superseded', 'Archived'] as const;
const HOLIDAY_SHIFTING_METHODS = ['None', 'NextWorkingDay', 'PreviousWorkingDay'] as const;
const DEMAND_GENERATION_RULES = [
  'OnInstallmentStartDate',
  'XDaysBeforeDue',
  'OnDueDate',
  'SpecificDate',
] as const;
const INITIAL_DEMAND_STATUSES = ['Draft', 'Published'] as const;

const normalizeEnum = <T extends string>(
  value: WireEnum<T>,
  values: readonly T[],
  fieldName: string
): T => {
  if (typeof value === 'number' && Number.isInteger(value) && values[value]) {
    return values[value];
  }
  if (typeof value === 'string' && values.includes(value as T)) {
    return value as T;
  }
  throw new Error(`Unsupported payment-term ${fieldName}: ${String(value)}`);
};

export const normalizePaymentTermListResponse = (
  response: PaymentTermListWireResponse
): PaymentTermListResponse => ({
  ...response,
  items: response.items.map((item) => ({
    ...item,
    status: normalizeEnum(item.status, PAYMENT_TERM_STATUSES, 'status'),
  })),
});

export const normalizePaymentTermDetailResponse = (
  response: PaymentTermDetailWireResponse
): PaymentTermDetailResponse => ({
  ...response,
  status: normalizeEnum(response.status, PAYMENT_TERM_STATUSES, 'status'),
  holidayShiftingMethod: normalizeEnum(
    response.holidayShiftingMethod,
    HOLIDAY_SHIFTING_METHODS,
    'holiday shifting method'
  ),
  demandGenerationRule: normalizeEnum(
    response.demandGenerationRule,
    DEMAND_GENERATION_RULES,
    'demand generation rule'
  ),
  initialDemandStatus: normalizeEnum(
    response.initialDemandStatus,
    INITIAL_DEMAND_STATUSES,
    'initial demand status'
  ),
  versions: response.versions.map((version) => ({
    ...version,
    status: normalizeEnum(version.status, PAYMENT_TERM_VERSION_STATUSES, 'version status'),
    holidayShiftingMethod: normalizeEnum(
      version.holidayShiftingMethod,
      HOLIDAY_SHIFTING_METHODS,
      'version holiday shifting method'
    ),
    demandGenerationRule: normalizeEnum(
      version.demandGenerationRule,
      DEMAND_GENERATION_RULES,
      'version demand generation rule'
    ),
  })),
});

export const normalizePaymentTermVersionHistoryResponse = (
  response: PaymentTermVersionHistoryWireResponse
): PaymentTermVersionHistoryResponse => ({
  ...response,
  items: response.items.map((version) => ({
    ...version,
    status: normalizeEnum(version.status, PAYMENT_TERM_VERSION_STATUSES, 'version status'),
  })),
});

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
      transformResponse: normalizePaymentTermListResponse,
      providesTags: [paymentTermType.paymentTerm],
    }),

    // ── Detail ──────────────────────────────────────────────────────────────
    getPaymentTermById: builder.query<PaymentTermDetailResponse, string>({
      query: (paymentTermId) => ({
        url: `/finance/payment-terms/${paymentTermId}`,
        method: 'GET',
      }),
      transformResponse: normalizePaymentTermDetailResponse,
      providesTags: (result, error, id) => [{ type: paymentTermType.paymentTerm, id }],
    }),

    // ── Version History ────────────────────────────────────────────────────
    getPaymentTermVersionHistory: builder.query<
      PaymentTermVersionHistoryResponse,
      { paymentTermId: string; skipCount?: number; maxResultCount?: number }
    >({
      query: ({ paymentTermId, skipCount = 0, maxResultCount = 50 }) => ({
        url: `/finance/payment-terms/${paymentTermId}/versions`,
        method: 'GET',
        params: { skipCount, maxResultCount },
      }),
      transformResponse: normalizePaymentTermVersionHistoryResponse,
      providesTags: (result, error, { paymentTermId }) => [
        { type: paymentTermType.paymentTerm, id: paymentTermId },
      ],
    }),

    // ── Create ──────────────────────────────────────────────────────────────
    createPaymentTerm: builder.mutation<PaymentTermDetailResponse, CreatePaymentTermRequest>({
      query: (body) => ({
        url: '/finance/payment-terms',
        method: 'POST',
        body,
      }),
      transformResponse: normalizePaymentTermDetailResponse,
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
      transformResponse: normalizePaymentTermDetailResponse,
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
      transformResponse: normalizePaymentTermDetailResponse,
      invalidatesTags: (result, error, { paymentTermId }) => [
        paymentTermType.paymentTerm,
        { type: paymentTermType.paymentTerm, id: paymentTermId },
      ],
    }),

    // ── Publish Version ─────────────────────────────────────────────────────
    publishVersion: builder.mutation<
      PublishResultResponse,
      { paymentTermId: string; versionId: string }
    >({
      query: ({ paymentTermId, versionId }) => ({
        url: `/finance/payment-terms/${paymentTermId}/versions/${versionId}/publish`,
        method: 'POST',
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
      transformResponse: normalizePaymentTermDetailResponse,
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
  useGetPaymentTermVersionHistoryQuery,
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
