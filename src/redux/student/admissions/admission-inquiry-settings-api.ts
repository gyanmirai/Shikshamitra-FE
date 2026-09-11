import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionCounsellorChoice = { id: string; userName: string; name: string };
const unwrap = <T>(response: T[] | { data: T[] }) =>
  Array.isArray(response) ? response : response.data;

export const admissionInquirySettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionInquiryCounsellors: builder.query<AdmissionCounsellorChoice[], string | void>({
      query: (filter) => ({
        url: '/student/enrollment/admissions/inquiry-settings/counsellors',
        params: filter ? { filter } : undefined,
      }),
      transformResponse: unwrap<AdmissionCounsellorChoice>,
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
  }),
  overrideExisting: true,
});

export const { useGetAdmissionInquiryCounsellorsQuery } = admissionInquirySettingsApi;
