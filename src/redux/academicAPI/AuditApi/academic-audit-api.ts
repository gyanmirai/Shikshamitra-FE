import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
};

export type AcademicAuditChangedField = {
  field: string;
  displayName: string;
  oldValue?: string | null;
  newValue?: string | null;
  changeType: string;
};

export type AcademicAuditEvent = {
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
  actorUserId?: string | null;
  actorNameSnapshot?: string | null;
  actorDisplayName: string;
  actorRoleSnapshot?: string | null;
  occurredAt: string;
  occurredAtUtc?: string;
  occurredAtDisplay?: string;
  changedFields: AcademicAuditChangedField[];
  changedFieldCount: number;
  contextJson?: string | null;
  correlationId?: string | null;
  sourceAuditLogId?: string | null;
  source: string;
};

export type AcademicAuditEventListArgs = {
  academicYearId?: string;
  academicMediumId?: string;
  subModuleCode?: string;
  entityType?: string;
  entityId?: string;
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

const academicAuditTag = { type: academicType.academicAudit, id: 'LIST' } as const;

export const academicAuditApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicAuditEvents: builder.query<
      PagedResult<AcademicAuditEvent>,
      AcademicAuditEventListArgs
    >({
      query: (params) => ({
        url: '/academic/audit-events',
        method: 'GET',
        params,
      }),
      providesTags: [academicAuditTag],
    }),

    getAcademicAuditEvent: builder.query<AcademicAuditEvent, string>({
      query: (id) => ({
        url: `/academic/audit-events/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: academicType.academicAudit, id }],
    }),

    getAcademicEntityAuditEvents: builder.query<
      PagedResult<AcademicAuditEvent>,
      { entityType: string; entityId: string } & AcademicAuditEventListArgs
    >({
      query: ({ entityType, entityId, ...params }) => ({
        url: `/academic/${entityType}/${entityId}/audit-events`,
        method: 'GET',
        params,
      }),
      providesTags: [academicAuditTag],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAcademicAuditEventsQuery,
  useGetAcademicAuditEventQuery,
  useGetAcademicEntityAuditEventsQuery,
} = academicAuditApi;
