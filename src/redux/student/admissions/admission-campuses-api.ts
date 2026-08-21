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
    getAdmissionCampuses: builder.query<AdmissionCampusListResult, void>({
      query: () => ({
        url: '/student/enrollment/admissions/campuses',
        params: { isActive: true, skipCount: 0, maxResultCount: 100 },
      }),
      transformResponse: (
        response: ResultEnvelope<AdmissionCampusListResult> | AdmissionCampusListResult
      ) => unwrapResult(response),
      providesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
  }),
  overrideExisting: true,
});

export const { useGetAdmissionCampusesQuery } = admissionCampusesApi;
