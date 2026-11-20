import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';

export type StockLocation = {
  id: string;
  sectionName: string;
  shelfDetails: { id: string; shelfName: string }[];
};

export type StockCountOptions = {
  canCountWholeSchool: boolean;
  schoolDate: string | null;
  schoolDateSource: string;
  sections: StockLocation[];
};

export type StockCountInput = {
  name: string;
  sectionId: string | null;
  shelfId: string | null;
  schoolDate: string | null;
};

export type StockCountPreview = {
  schoolDate: string;
  schoolDateSource: string;
  expectedCopyCount: number;
  statusTotals: { copyStatus: number; count: number }[];
  revision: string;
};

export type StockCount = {
  id: string;
  name: string;
  sectionId: string | null;
  shelfId: string | null;
  academicYearId: string | null;
  schoolDate: string;
  expectedCopyCount: number;
  observationCount: number;
  status: number;
  openedAt: string;
  cancellationReason: string | null;
};

export type StockBaseline = {
  copyId: string;
  accessionNumber: string;
  sectionId: string;
  shelfId: string;
  copyStatus: number;
};

export type StockObservation = {
  id: string;
  sequence: number;
  accessionNumber: string;
  copyId: string | null;
  observedSectionId: string | null;
  observedShelfId: string | null;
  schoolDate: string;
  observedAt: string;
};

export type StockReconciliationSource = 1 | 2 | 3;

export type StockReconciliationRow = {
  id: string;
  accessionNumber: string;
  finding: number;
  requiresReview: boolean;
  baselineStatus: number | null;
  currentStatus: number | null;
  expectedSectionId: string | null;
  expectedShelfId: string | null;
  observedSectionId: string | null;
  observedShelfId: string | null;
  observationSequence: number | null;
  evidenceRevision: string;
  decision: StockDecision | null;
  decisionIsCurrent: boolean;
  receivedAfterOpening?: boolean;
};

export type StockDecisionOutcome = 1 | 2 | 3;
export type StockDecision = {
  id: string;
  source: StockReconciliationSource;
  rowId: string;
  version: number;
  accessionNumber: string;
  finding: number;
  outcome: StockDecisionOutcome;
  reason: string;
  decidedAt: string;
};

export type StockDecisionInput = {
  source: StockReconciliationSource;
  rowId: string;
  evidenceRevision: string;
  expectedDecisionId: string | null;
  outcome: StockDecisionOutcome;
  reason: string;
};

export type StockApprovalPreview = {
  expectedCopyCount: number;
  observationCount: number;
  findingCount: number;
  discrepancyCount: number;
  missingDecisionCount: number;
  staleDecisionCount: number;
  revision: string;
  canFinalize: boolean;
};

export type StockPublishedFinding = {
  id: string;
  accessionNumber: string;
  finding: number;
  baselineStatus: number | null;
  currentStatus: number | null;
  expectedLocation: string | null;
  observedLocation: string | null;
  observationSequence: number | null;
  decision: StockDecision | null;
  receivedAfterOpening?: boolean;
};

export type StockPublishedResult = {
  publishedAt: string;
  publishedBy: string;
  expectedCopyCount: number;
  observationCount: number;
  findingCount: number;
  discrepancyCount: number;
  findings: StockCountPage<StockPublishedFinding>;
};

export type FinalizeStockCount = { revision: string; idempotencyKey: string };

export type OpenStockCount = { count: StockCountInput; revision: string; idempotencyKey: string };

export type ObserveStock = {
  scan: string;
  sectionId: string | null;
  shelfId: string | null;
  schoolDate: string | null;
  idempotencyKey: string;
};

export type StockCountTransitionInput =
  | { action: 'review'; expectedObservationCount: number }
  | { action: 'cancel'; expectedObservationCount: number; expectedStatus: number; reason: string };

type StockCountTransition = {
  sessionId: string;
  status: number;
  observationCount: number;
};

type StockCountTransitionRequest = StockCountTransitionInput & {
  id: string;
  idempotencyKey: string;
};

export type StockCountPageParams = { page: number; pageSize: number };
type StockCountPage<T> = { items: T[]; totalCount: number; totalPages: number };
type DetailParams = StockCountPageParams & { id: string };

const root = '/library/stock-verification';
const tag = libraryModuleType.stockVerification;
const sessionUrl = (id: string) => `${root}/${encodeURIComponent(id)}`;
const sessionTag = (id: string) => ({ type: tag, id });

export const libraryStockVerificationApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockCountOptions: builder.query<StockCountOptions, void>({
      query: () => `${root}/options`,
      providesTags: [libraryModuleType.librarySettings],
    }),
    getStockCounts: builder.query<StockCountPage<StockCount>, StockCountPageParams>({
      query: (params) => ({ url: root, params }),
      providesTags: [sessionTag('list')],
    }),
    getStockCount: builder.query<StockCount, string>({
      query: sessionUrl,
      providesTags: (_result, _error, id) => [sessionTag(id)],
    }),
    getStockCountBaseline: builder.query<StockCountPage<StockBaseline>, DetailParams>({
      query: ({ id, ...params }) => ({ url: `${sessionUrl(id)}/baseline`, params }),
      providesTags: (_result, _error, { id }) => [sessionTag(`${id}/baseline`)],
    }),
    getStockCountObservations: builder.query<StockCountPage<StockObservation>, DetailParams>({
      query: ({ id, ...params }) => ({ url: `${sessionUrl(id)}/observations`, params }),
      providesTags: (_result, _error, { id }) => [sessionTag(`${id}/observations`)],
    }),
    getStockReconciliation: builder.query<
      StockCountPage<StockReconciliationRow>,
      DetailParams & { source: StockReconciliationSource }
    >({
      query: ({ id, ...params }) => ({ url: `${sessionUrl(id)}/reconciliation`, params }),
      providesTags: (_result, _error, { id }) => [
        sessionTag(`${id}/reconciliation`),
        libraryModuleType.copies,
        libraryModuleType.bookIssue,
        libraryModuleType.bookReturn,
        libraryModuleType.bookReservation,
      ],
    }),
    getStockDecisions: builder.query<StockCountPage<StockDecision>, DetailParams>({
      query: ({ id, ...params }) => ({ url: `${sessionUrl(id)}/decisions`, params }),
      providesTags: (_result, _error, { id }) => [sessionTag(`${id}/decisions`)],
    }),
    getStockApprovalPreview: builder.query<StockApprovalPreview, string>({
      query: (id) => `${sessionUrl(id)}/approval-preview`,
      keepUnusedDataFor: 0,
    }),
    getStockPublishedResult: builder.query<
      StockPublishedResult,
      DetailParams & { source: StockReconciliationSource }
    >({
      query: ({ id, ...params }) => ({ url: `${sessionUrl(id)}/result`, params }),
      providesTags: (_result, _error, { id }) => [sessionTag(`${id}/result`)],
    }),
    previewStockCount: builder.mutation<StockCountPreview, StockCountInput>({
      query: (body) => ({ url: `${root}/preview`, method: 'POST', body }),
    }),
    openStockCount: builder.mutation<StockCount, OpenStockCount>({
      query: (body) => ({ url: root, method: 'POST', body }),
      invalidatesTags: (result) => (result ? [sessionTag('list')] : []),
    }),
    recordStockObservation: builder.mutation<StockObservation, { id: string; body: ObserveStock }>({
      query: ({ id, body }) => ({ url: `${sessionUrl(id)}/observations`, method: 'POST', body }),
      invalidatesTags: (result, error, { id }) =>
        result
          ? [
              sessionTag(id),
              sessionTag(`${id}/observations`),
              sessionTag(`${id}/reconciliation`),
              sessionTag('list'),
            ]
          : error?.status === 409
            ? [sessionTag(id)]
            : [],
    }),
    transitionStockCount: builder.mutation<StockCountTransition, StockCountTransitionRequest>({
      query: ({ id, action, ...body }) => ({
        url: `${sessionUrl(id)}/${action}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) =>
        result
          ? [
              sessionTag(id),
              sessionTag('list'),
              ...(result.status === 2 ? [sessionTag(`${id}/reconciliation`)] : []),
            ]
          : error?.status === 409
            ? [sessionTag(id), sessionTag(`${id}/observations`)]
            : [],
    }),
    saveStockDecision: builder.mutation<
      StockDecision,
      { id: string; body: StockDecisionInput & { idempotencyKey: string } }
    >({
      query: ({ id, body }) => ({ url: `${sessionUrl(id)}/decisions`, method: 'POST', body }),
      invalidatesTags: (result, error, { id }) =>
        result || error?.status === 409
          ? [sessionTag(`${id}/decisions`), sessionTag(`${id}/reconciliation`)]
          : [],
    }),
    finalizeStockCount: builder.mutation<
      StockCountTransition,
      { id: string; body: FinalizeStockCount }
    >({
      query: ({ id, body }) => ({ url: `${sessionUrl(id)}/finalize`, method: 'POST', body }),
      invalidatesTags: (result, error, { id }) =>
        result
          ? [sessionTag(id), sessionTag('list'), sessionTag(`${id}/result`)]
          : error?.status === 409
            ? [sessionTag(id)]
            : [],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStockCountOptionsQuery,
  useGetStockCountsQuery,
  useGetStockCountQuery,
  useGetStockCountBaselineQuery,
  useGetStockCountObservationsQuery,
  useGetStockReconciliationQuery,
  useGetStockDecisionsQuery,
  useGetStockApprovalPreviewQuery,
  useGetStockPublishedResultQuery,
  usePreviewStockCountMutation,
  useOpenStockCountMutation,
  useRecordStockObservationMutation,
  useTransitionStockCountMutation,
  useSaveStockDecisionMutation,
  useFinalizeStockCountMutation,
} = libraryStockVerificationApi;
