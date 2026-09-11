import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionReviewerChoice = { id: string; userName: string; name: string };
type ReviewRole = { id: string; name: string };
type ReviewersQuery = { filter?: string; role?: string };
const unwrap = <T>(response: T[] | { data: T[] }) =>
  Array.isArray(response) ? response : response.data;

export const admissionReviewSettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionReviewRoles: builder.query<ReviewRole[], void>({
      query: () => '/student/enrollment/admissions/reviews/reviewer-roles',
      transformResponse: unwrap<ReviewRole>,
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
    getAdmissionReviewers: builder.query<AdmissionReviewerChoice[], ReviewersQuery>({
      query: (params) => ({ url: '/student/enrollment/admissions/reviews/reviewers', params }),
      transformResponse: unwrap<AdmissionReviewerChoice>,
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
  }),
  overrideExisting: true,
});

export const { useGetAdmissionReviewRolesQuery, useGetAdmissionReviewersQuery } =
  admissionReviewSettingsApi;
