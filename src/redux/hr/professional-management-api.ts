import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

const compactParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

export type ProfessionalReviewCycle = {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: number;
};

export type ProfessionalReview = {
  id: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeName: string;
  employeeIdentifier?: string | null;
  employeeRole?: string | null;
  communicationScore: number;
  problemSolvingScore: number;
  comments?: string | null;
  feedback?: string | null;
  status: number;
  submittedAt?: string | null;
};

export const professionalManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfessionalReviewCycles: builder.query({
      query: (params = {}) => ({
        url: '/hr/professional-management/review-cycles',
        method: 'GET',
        params: compactParams({ page: 1, pageSize: 20, ...params }),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    createProfessionalReviewCycle: builder.mutation({
      query: (body) => ({
        url: '/hr/professional-management/review-cycles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    updateProfessionalReviewCycle: builder.mutation({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/review-cycles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    getProfessionalCycleReviews: builder.query({
      query: ({ id, search }) => ({
        url: `/hr/professional-management/review-cycles/${id}/reviews`,
        method: 'GET',
        params: compactParams({ search }),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    saveProfessionalReviewDraft: builder.mutation({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/draft`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    submitProfessionalReview: builder.mutation({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    getEmployeeProfessionalReviewHistory: builder.query({
      query: (employeeId) => `/hr/professional-management/employees/${employeeId}/review-history`,
      providesTags: [employeeType.professionalReview],
    }),
  }),
});

export const {
  useGetProfessionalReviewCyclesQuery,
  useCreateProfessionalReviewCycleMutation,
  useUpdateProfessionalReviewCycleMutation,
  useGetProfessionalCycleReviewsQuery,
  useSaveProfessionalReviewDraftMutation,
  useSubmitProfessionalReviewMutation,
  useGetEmployeeProfessionalReviewHistoryQuery,
} = professionalManagementApi;
