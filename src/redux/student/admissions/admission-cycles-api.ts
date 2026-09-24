import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionCycleStatus = 0 | 1 | 2 | 3;
export type AdmissionCycleWindowStatus = 0 | 1 | 2 | 3 | 4;
export type AdmissionCycleHistoryAction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type AdmissionCycle = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  academicYearId: string;
  academicYearName: string;
  startDate: string;
  endDate: string;
  status: AdmissionCycleStatus;
  windowStatus: AdmissionCycleWindowStatus;
  isAcceptingApplications: boolean;
  publishedAt?: string | null;
  publishedBy?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  reopenedAt?: string | null;
  reopenedBy?: string | null;
  archivedAt?: string | null;
  archivedBy?: string | null;
  scheduledPublishAt?: string | null;
  scheduledCloseAt?: string | null;
  linkedOfferingCount: number;
  activeOfferingCount: number;
  applicationCount: number;
  concurrencyStamp: string;
};

export type AdmissionCycleListInput = {
  search?: string;
  academicYearId?: string;
  status?: AdmissionCycleStatus;
  windowStatus?: AdmissionCycleWindowStatus;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
};

export type PagedResult<T> = { totalCount: number; items: T[] };

export type CreateUpdateAdmissionCycle = {
  name: string;
  code: string;
  description?: string | null;
  academicYearId: string;
  startDate: string;
  endDate: string;
  concurrencyStamp?: string | null;
};

export type AdmissionCycleAction = {
  concurrencyStamp?: string | null;
  reason?: string | null;
  confirmActiveOfferings?: boolean;
};

export type ReopenAdmissionCycle = AdmissionCycleAction & { newEndDate?: string | null };
export type UpdateAdmissionCycleWindow = AdmissionCycleAction & {
  startDate: string;
  endDate: string;
};
export type ScheduleAdmissionCycle = {
  concurrencyStamp?: string | null;
  publishAt?: string | null;
  closeAt?: string | null;
};
export type CloneAdmissionCycle = CreateUpdateAdmissionCycle & { sourceCycleId: string };

export type AdmissionCycleValidationIssue = { code: string; message: string };
export type AdmissionCycleValidation = {
  isValid: boolean;
  errors: AdmissionCycleValidationIssue[];
  warnings: AdmissionCycleValidationIssue[];
};

export type AdmissionCycleImpact = {
  admissionCycleId: string;
  linkedOfferingCount: number;
  activeOfferingCount: number;
  applicationCount: number;
  draftApplicationCount: number;
  submittedApplicationCount: number;
  requiresActiveOfferingConfirmation: boolean;
};

export type AdmissionCycleHistory = {
  id: string;
  admissionCycleId: string;
  action: AdmissionCycleHistoryAction;
  fromStatus?: AdmissionCycleStatus | null;
  toStatus?: AdmissionCycleStatus | null;
  description: string;
  reason?: string | null;
  occurredAt: string;
  creatorId?: string | null;
};

export type AdmissionCycleOfferingCapacity = {
  admissionOfferingId: string;
  offeringName: string;
  offeringCode: string;
  isActive: boolean;
  isSeatManaged: boolean;
  isConfigured: boolean;
  capacity?: number | null;
  reservedCount: number;
  confirmedCount: number;
  waitlistedCount: number;
  remainingCapacity?: number | null;
  isOverCapacity: boolean;
  poolConcurrencyStamp?: string | null;
};

export type AdmissionCycleCapacitySummary = {
  admissionCycleId: string;
  offeringCount: number;
  activeOfferingCount: number;
  seatManagedOfferingCount: number;
  configuredOfferingCount: number;
  unconfiguredOfferingCount: number;
  notSeatManagedOfferingCount: number;
  totalCapacity: number;
  reservedCount: number;
  confirmedCount: number;
  waitlistedCount: number;
  occupiedCount: number;
  remainingCapacity: number;
  overCapacityOfferingCount: number;
  offerings: AdmissionCycleOfferingCapacity[];
};

export type UpdateAdmissionCycleOfferingCapacity = {
  capacity: number;
  reason: string;
  poolConcurrencyStamp?: string | null;
};

type ResultEnvelope<T> = { data?: T };

const unwrapResult = <T>(response: ResultEnvelope<T> | T): T => {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    const envelope = response as ResultEnvelope<T>;
    if (envelope.data !== undefined) return envelope.data;
  }
  return response as T;
};

const cycleTags = [studentAdmissionsCrmType.admissionCycle];

export const admissionCyclesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionCycles: builder.query<PagedResult<AdmissionCycle>, AdmissionCycleListInput>({
      query: (params) => ({ url: '/student/enrollment/admissions/cycles', method: 'GET', params }),
      transformResponse: (
        response: ResultEnvelope<PagedResult<AdmissionCycle>> | PagedResult<AdmissionCycle>
      ) => unwrapResult(response),
      providesTags: cycleTags,
    }),
    getAdmissionCycle: builder.query<AdmissionCycle, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/cycles/${id}`, method: 'GET' }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) =>
        unwrapResult(response),
      providesTags: cycleTags,
    }),
    createAdmissionCycle: builder.mutation<AdmissionCycle, CreateUpdateAdmissionCycle>({
      query: (body) => ({ url: '/student/enrollment/admissions/cycles', method: 'POST', body }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) =>
        unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    updateAdmissionCycle: builder.mutation<AdmissionCycle, { id: string; body: CreateUpdateAdmissionCycle }>({
      query: ({ id, body }) => ({ url: `/student/enrollment/admissions/cycles/${id}`, method: 'PUT', body }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    publishAdmissionCycle: builder.mutation<AdmissionCycle, { id: string; concurrencyStamp: string }>({
      query: ({ id, concurrencyStamp }) => ({ url: `/student/enrollment/admissions/cycles/${id}/publish`, method: 'POST', params: { concurrencyStamp } }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    closeAdmissionCycle: builder.mutation<AdmissionCycle, { id: string; body: AdmissionCycleAction }>({
      query: ({ id, body }) => ({ url: `/student/enrollment/admissions/cycles/${id}/close`, method: 'POST', body }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    reopenAdmissionCycle: builder.mutation<AdmissionCycle, { id: string; body: ReopenAdmissionCycle }>({
      query: ({ id, body }) => ({ url: `/student/enrollment/admissions/cycles/${id}/reopen`, method: 'POST', body }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    archiveAdmissionCycle: builder.mutation<AdmissionCycle, { id: string; body: AdmissionCycleAction }>({
      query: ({ id, body }) => ({ url: `/student/enrollment/admissions/cycles/${id}/archive`, method: 'POST', body }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    deleteAdmissionCycle: builder.mutation<void, { id: string; concurrencyStamp: string }>({
      query: ({ id, concurrencyStamp }) => ({ url: `/student/enrollment/admissions/cycles/${id}`, method: 'DELETE', params: { concurrencyStamp } }),
      invalidatesTags: cycleTags,
    }),
    cloneAdmissionCycle: builder.mutation<AdmissionCycle, CloneAdmissionCycle>({
      query: (body) => ({ url: '/student/enrollment/admissions/cycles/clone', method: 'POST', body }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    updateAdmissionCycleWindow: builder.mutation<AdmissionCycle, { id: string; body: UpdateAdmissionCycleWindow }>({
      query: ({ id, body }) => ({ url: `/student/enrollment/admissions/cycles/${id}/window`, method: 'PUT', body }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    scheduleAdmissionCycle: builder.mutation<AdmissionCycle, { id: string; body: ScheduleAdmissionCycle }>({
      query: ({ id, body }) => ({ url: `/student/enrollment/admissions/cycles/${id}/schedule`, method: 'PUT', body }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
    validateAdmissionCycle: builder.mutation<AdmissionCycleValidation, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/cycles/${id}/validate`, method: 'POST' }),
      transformResponse: (response: ResultEnvelope<AdmissionCycleValidation> | AdmissionCycleValidation) => unwrapResult(response),
    }),
    getAdmissionCycleImpact: builder.query<AdmissionCycleImpact, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/cycles/${id}/impact`, method: 'GET' }),
      transformResponse: (response: ResultEnvelope<AdmissionCycleImpact> | AdmissionCycleImpact) => unwrapResult(response),
    }),
    getAdmissionCycleHistory: builder.query<AdmissionCycleHistory[], string>({
      query: (id) => ({ url: `/student/enrollment/admissions/cycles/${id}/history`, method: 'GET' }),
      transformResponse: (response: ResultEnvelope<AdmissionCycleHistory[]> | AdmissionCycleHistory[]) => unwrapResult(response),
    }),
    getAdmissionCycleCapacity: builder.query<AdmissionCycleCapacitySummary, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/cycles/${id}/capacity`, method: 'GET' }),
      transformResponse: (
        response: ResultEnvelope<AdmissionCycleCapacitySummary> | AdmissionCycleCapacitySummary
      ) => unwrapResult(response),
      providesTags: cycleTags,
    }),
    updateAdmissionCycleOfferingCapacity: builder.mutation<
      AdmissionCycleCapacitySummary,
      { cycleId: string; offeringId: string; body: UpdateAdmissionCycleOfferingCapacity }
    >({
      query: ({ cycleId, offeringId, body }) => ({
        url: `/student/enrollment/admissions/cycles/${cycleId}/offerings/${offeringId}/capacity`,
        method: 'PUT',
        body,
      }),
      transformResponse: (
        response: ResultEnvelope<AdmissionCycleCapacitySummary> | AdmissionCycleCapacitySummary
      ) => unwrapResult(response),
      invalidatesTags: cycleTags,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdmissionCyclesQuery,
  useGetAdmissionCycleQuery,
  useCreateAdmissionCycleMutation,
  useUpdateAdmissionCycleMutation,
  usePublishAdmissionCycleMutation,
  useCloseAdmissionCycleMutation,
  useReopenAdmissionCycleMutation,
  useArchiveAdmissionCycleMutation,
  useDeleteAdmissionCycleMutation,
  useCloneAdmissionCycleMutation,
  useUpdateAdmissionCycleWindowMutation,
  useScheduleAdmissionCycleMutation,
  useValidateAdmissionCycleMutation,
  useGetAdmissionCycleImpactQuery,
  useLazyGetAdmissionCycleImpactQuery,
  useGetAdmissionCycleHistoryQuery,
  useGetAdmissionCycleCapacityQuery,
  useUpdateAdmissionCycleOfferingCapacityMutation,
} = admissionCyclesApi;
