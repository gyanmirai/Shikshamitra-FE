import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionCycleStatus = 0 | 1 | 2 | 3;

export type AdmissionCycle = {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  status: AdmissionCycleStatus;
  publishedAt?: string | null;
};

export type AdmissionCycleListInput = {
  search?: string;
  academicYearId?: string;
  status?: AdmissionCycleStatus;
  skipCount?: number;
  maxResultCount?: number;
};

export type PagedResult<T> = {
  totalCount: number;
  items: T[];
};

export type CreateUpdateAdmissionCycle = {
  name: string;
  code: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
};

export type AdmissionOffering = {
  id: string;
  admissionCycleId: string;
  campusId?: string | null;
  boardId: string;
  mediumId: string;
  stageId: string;
  standardId: string;
  code: string;
  openDate: string;
  closeDate: string;
  isActive: boolean;
  workflowDefinitionId?: string | null;
  inquiryFormDefinitionId?: string | null;
  applicationFormDefinitionId?: string | null;
};

export type CreateUpdateAdmissionOffering = Omit<AdmissionOffering, 'id' | 'admissionCycleId'> & {
  id?: string;
};

export type AdmissionOfferingListInput = {
  admissionCycleId?: string;
  boardId?: string;
  mediumId?: string;
  stageId?: string;
  standardId?: string;
  isActive?: boolean;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
};

type ResultEnvelope<T> = { data?: T };

const unwrapResult = <T>(response: ResultEnvelope<T> | T): T => {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    const envelope = response as ResultEnvelope<T>;
    if (envelope.data !== undefined) return envelope.data;
  }
  return response as T;
};

export const admissionCyclesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionCycles: builder.query<PagedResult<AdmissionCycle>, AdmissionCycleListInput>({
      query: (params) => ({
        url: '/student/enrollment/admissions/cycles',
        method: 'GET',
        params,
      }),
      transformResponse: (
        response: ResultEnvelope<PagedResult<AdmissionCycle>> | PagedResult<AdmissionCycle>
      ) => unwrapResult(response),
      providesTags: [studentAdmissionsCrmType.admissionCycle],
    }),
    createAdmissionCycle: builder.mutation<AdmissionCycle, CreateUpdateAdmissionCycle>({
      query: (body) => ({
        url: '/student/enrollment/admissions/cycles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionCycle],
    }),
    updateAdmissionCycle: builder.mutation<
      AdmissionCycle,
      { id: string; body: CreateUpdateAdmissionCycle }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/cycles/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionCycle],
    }),
    publishAdmissionCycle: builder.mutation<AdmissionCycle, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/cycles/${id}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionCycle],
    }),
    closeAdmissionCycle: builder.mutation<AdmissionCycle, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/cycles/${id}/close`, method: 'POST' }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionCycle],
    }),
    archiveAdmissionCycle: builder.mutation<AdmissionCycle, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/cycles/${id}/archive`,
        method: 'POST',
      }),
      transformResponse: (response: ResultEnvelope<AdmissionCycle> | AdmissionCycle) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionCycle],
    }),
    getAdmissionOfferings: builder.query<
      PagedResult<AdmissionOffering>,
      AdmissionOfferingListInput
    >({
      query: (params) => ({
        url: '/student/enrollment/admissions/offerings',
        method: 'GET',
        params,
      }),
      transformResponse: (
        response: ResultEnvelope<PagedResult<AdmissionOffering>> | PagedResult<AdmissionOffering>
      ) => unwrapResult(response),
      providesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    createAdmissionOffering: builder.mutation<
      AdmissionOffering,
      { admissionCycleId: string; body: CreateUpdateAdmissionOffering }
    >({
      query: ({ admissionCycleId, body }) => ({
        url: '/student/enrollment/admissions/offerings',
        method: 'POST',
        params: { admissionCycleId },
        body,
      }),
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    updateAdmissionOffering: builder.mutation<
      AdmissionOffering,
      { id: string; body: CreateUpdateAdmissionOffering }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/offerings/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    setAdmissionOfferingActive: builder.mutation<
      AdmissionOffering,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/student/enrollment/admissions/offerings/${id}/active`,
        method: 'POST',
        params: { isActive },
      }),
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdmissionCyclesQuery,
  useCreateAdmissionCycleMutation,
  useUpdateAdmissionCycleMutation,
  usePublishAdmissionCycleMutation,
  useCloseAdmissionCycleMutation,
  useArchiveAdmissionCycleMutation,
  useGetAdmissionOfferingsQuery,
  useCreateAdmissionOfferingMutation,
  useUpdateAdmissionOfferingMutation,
  useSetAdmissionOfferingActiveMutation,
} = admissionCyclesApi;
