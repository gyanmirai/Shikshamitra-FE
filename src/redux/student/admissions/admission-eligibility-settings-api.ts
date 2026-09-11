import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

type EligibilityReviewerRole = { id: string; name: string };
export const admissionEligibilitySettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEligibilityReviewerRoles: builder.query<EligibilityReviewerRole[], void>({
      query: () => '/student/enrollment/admissions/eligibility/reviewer-roles',
      transformResponse: (
        response: EligibilityReviewerRole[] | { data: EligibilityReviewerRole[] }
      ) => (Array.isArray(response) ? response : response.data),
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
  }),
  overrideExisting: true,
});
export const { useGetEligibilityReviewerRolesQuery } = admissionEligibilitySettingsApi;
