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
      query: (params) => ({ url: '/student/enrollment/admissions/cycles', method: 'GET', params }),
      transformResponse: (
        response: ResultEnvelope<PagedResult<AdmissionCycle>> | PagedResult<AdmissionCycle>
      ) => unwrapResult(response),
      providesTags: [studentAdmissionsCrmType.admissionCycle],
    }),
    createAdmissionCycle: builder.mutation<AdmissionCycle, CreateUpdateAdmissionCycle>({
      query: (body) => ({ url: '/student/enrollment/admissions/cycles', method: 'POST', body }),
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
} = admissionCyclesApi;
