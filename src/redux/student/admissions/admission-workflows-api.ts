import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionWorkflowStatus = 0 | 1 | 2;
export type AdmissionWorkflowStageType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type AdmissionWorkflowStage = {
  id: string;
  workflowDefinitionId?: string;
  code: string;
  name: string;
  description?: string;
  stageType: AdmissionWorkflowStageType;
  displayOrder: number;
  isRequired: boolean;
  allowManualSkip: boolean;
  configurationJson?: string;
};
export type AdmissionWorkflowTransition = {
  id: string;
  workflowDefinitionId?: string;
  fromStageId: string;
  toStageId: string;
  priority: number;
};
export type AdmissionWorkflow = {
  id: string;
  name: string;
  code: string;
  version: number;
  status: AdmissionWorkflowStatus;
  parentVersionId?: string | null;
  publishedAt?: string | null;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};
export type CreateUpdateAdmissionWorkflow = {
  name: string;
  code: string;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};
type Result<T> = { data?: T };
const unwrap = <T>(response: Result<T> | T): T => {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    response.data !== undefined
  )
    return response.data;
  return response as T;
};
export const admissionWorkflowsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionWorkflow: builder.query<AdmissionWorkflow, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/workflows/${id}` }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) => unwrap(r),
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
    getAdmissionWorkflows: builder.query<
      { totalCount: number; items: AdmissionWorkflow[] },
      {
        search?: string;
        status?: AdmissionWorkflowStatus;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: (params) => ({ url: '/student/enrollment/admissions/workflows', params }),
      transformResponse: (
        r:
          | Result<{ totalCount: number; items: AdmissionWorkflow[] }>
          | { totalCount: number; items: AdmissionWorkflow[] }
      ) => unwrap(r),
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
    createAdmissionWorkflow: builder.mutation<AdmissionWorkflow, CreateUpdateAdmissionWorkflow>({
      query: (body) => ({ url: '/student/enrollment/admissions/workflows', method: 'POST', body }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
    updateAdmissionWorkflow: builder.mutation<
      AdmissionWorkflow,
      { id: string; body: CreateUpdateAdmissionWorkflow }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/workflows/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
    cloneAdmissionWorkflow: builder.mutation<AdmissionWorkflow, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/workflows/${id}/clone`,
        method: 'POST',
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
    validateAdmissionWorkflow: builder.mutation<{ isValid: boolean; errors: string[] }, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/workflows/${id}/validate`,
        method: 'POST',
      }),
      transformResponse: (
        r: Result<{ isValid: boolean; errors: string[] }> | { isValid: boolean; errors: string[] }
      ) => unwrap(r),
    }),
    publishAdmissionWorkflow: builder.mutation<AdmissionWorkflow, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/workflows/${id}/publish`,
        method: 'POST',
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
  }),
});
export const {
  useGetAdmissionWorkflowsQuery,
  useGetAdmissionWorkflowQuery,
  useCreateAdmissionWorkflowMutation,
  useUpdateAdmissionWorkflowMutation,
  useCloneAdmissionWorkflowMutation,
  useValidateAdmissionWorkflowMutation,
  usePublishAdmissionWorkflowMutation,
} = admissionWorkflowsApi;
