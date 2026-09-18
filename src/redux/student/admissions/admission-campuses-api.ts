import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionCampus = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

type AdmissionCampusListResult = {
  totalCount: number;
  items: AdmissionCampus[];
};

export type AdmissionCampusListInput = {
  search?: string;
  isActive?: boolean;
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

export const admissionCampusesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionCampus: builder.query<AdmissionCampus, string>({
      query: (id) => ({ url: `/app/admission-campus/${id}` }),
      transformResponse: (response: ResultEnvelope<AdmissionCampus> | AdmissionCampus) =>
        unwrapResult(response),
      providesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    getAdmissionCampuses: builder.query<AdmissionCampusListResult, AdmissionCampusListInput | void>(
      {
        query: (input) => ({
          url: '/app/admission-campus',
          params: { isActive: true, skipCount: 0, maxResultCount: 25, ...input },
        }),
        transformResponse: (
          response: ResultEnvelope<AdmissionCampusListResult> | AdmissionCampusListResult
        ) => unwrapResult(response),
        providesTags: [studentAdmissionsCrmType.admissionOffering],
      }
    ),
  }),
  overrideExisting: true,
});

export const {
  useGetAdmissionCampusQuery,
  useGetAdmissionCampusesQuery,
  useLazyGetAdmissionCampusesQuery,
} = admissionCampusesApi;
