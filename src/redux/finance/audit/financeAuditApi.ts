import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
};

export type FinanceAuditChangedField = {
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
};

export type FinanceAuditEvent = {
  id: string;
  academicYearId?: string | null;
  subModuleCode: string;
  subModuleDisplayName: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  actionLabel: string;
  summary: string;
  reason?: string | null;
  studentId?: string | null;
  studentNameSnapshot?: string | null;
  studentGrNoSnapshot?: string | null;
  studentRollNoSnapshot?: string | null;
  actorUserId?: string | null;
  actorNameSnapshot?: string | null;
  actorDisplayName: string;
  performedByRoleSnapshot?: string | null;
  occurredAt: string;
  occurredAtUtc?: string;
  occurredAtDisplay?: string;
  changedFields: FinanceAuditChangedField[];
  changedFieldCount?: number;
  contextJson?: string | null;
  correlationId?: string | null;
  sourceAuditLogId?: string | null;
};

export type FinanceAuditCorrelation = {
  correlationId: string;
  studentId?: string | null;
  studentNameSnapshot?: string | null;
  occurredAtFirst?: string | null;
  occurredAtLast?: string | null;
  eventCount: number;
  events: FinanceAuditEvent[];
};

export type FinanceAuditStudentLookup = {
  studentId: string;
  displayName: string;
  grNo?: string | null;
  rollNo?: string | null;
  standardDivision?: string | null;
  label: string;
};

export type FinanceAuditStudentLookupArgs = {
  academicYearId: string;
  search: string;
  maxResultCount?: number;
};

export type FinanceAuditEventListArgs = {
  academicYearId?: string;
  subModuleCode?: string;
  entityType?: string;
  entityId?: string;
  studentId?: string;
  action?: string;
  actorUserId?: string;
  correlationId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
};

const financeAuditTag = { type: financeModuleType.financeAudit, id: 'LIST' } as const;

export const financeAuditApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceAuditEvents: builder.query<PagedResult<FinanceAuditEvent>, FinanceAuditEventListArgs>(
      {
        query: (params) => ({
          url: '/finance/audit-events',
          method: 'GET',
          params,
        }),
        providesTags: [financeAuditTag],
      }
    ),

    getFinanceAuditEvent: builder.query<FinanceAuditEvent, string>({
      query: (id) => ({
        url: `/finance/audit-events/${id}`,
        method: 'GET',
      }),
      providesTags: (_r, _e, id) => [{ type: financeModuleType.financeAudit, id }],
    }),

    getFinanceStudentAuditEvents: builder.query<
      PagedResult<FinanceAuditEvent>,
      { studentId: string } & FinanceAuditEventListArgs
    >({
      query: ({ studentId, ...params }) => ({
        url: `/finance/students/${studentId}/audit-events`,
        method: 'GET',
        params,
      }),
      providesTags: [financeAuditTag],
    }),

    getFinanceEntityAuditEvents: builder.query<
      PagedResult<FinanceAuditEvent>,
      { entityType: string; entityId: string } & FinanceAuditEventListArgs
    >({
      query: ({ entityType, entityId, ...params }) => ({
        url: `/finance/${entityType}/${entityId}/audit-events`,
        method: 'GET',
        params,
      }),
      providesTags: [financeAuditTag],
    }),

    getFinanceAuditCorrelation: builder.query<
      FinanceAuditCorrelation,
      { correlationId: string; skipCount?: number; maxResultCount?: number }
    >({
      query: ({ correlationId, skipCount = 0, maxResultCount = 50 }) => ({
        url: `/finance/audit-events/by-correlation/${encodeURIComponent(correlationId)}`,
        method: 'GET',
        params: { skipCount, maxResultCount },
      }),
      providesTags: [financeAuditTag],
    }),

    getFinanceAuditStudentLookup: builder.query<
      FinanceAuditStudentLookup[],
      FinanceAuditStudentLookupArgs
    >({
      query: (params) => ({
        url: '/finance/students/audit-lookup',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { items?: FinanceAuditStudentLookup[] }) =>
        response?.items ?? [],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFinanceAuditEventsQuery,
  useLazyGetFinanceAuditEventsQuery,
  useGetFinanceAuditEventQuery,
  useGetFinanceStudentAuditEventsQuery,
  useGetFinanceEntityAuditEventsQuery,
  useGetFinanceAuditCorrelationQuery,
  useLazyGetFinanceAuditStudentLookupQuery,
} = financeAuditApi;
