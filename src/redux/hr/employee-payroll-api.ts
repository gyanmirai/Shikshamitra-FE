import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

export interface DayCalculationRequest {
  dayCalculationType: 'working-days' | 'total-days';
  totalDayType?: 'total-month-days' | 'manual-days';
  manualDays?: number;
}

export interface DayCalculationResponse {
  success: boolean;
  message: string;
}

export const employeePayrollApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeductionComponents: builder.query({
      query: ({ page = 1, pageSize = 20, academicYearId, search }) => ({
        url: '/payroll/deduction-components',
        method: 'GET',
        params: { page, pageSize, academicYearId, search },
      }),
      providesTags: [employeeType.deductionComponents],
    }),
    getDeductionComponentById: builder.query({
      query: (id) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.deductionComponents],
    }),
    addDeductionComponent: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/payroll/deduction-components',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.deductionComponents],
    }),
    updateDeductionComponent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        employeeType.deductionComponents,
        employeeType.employeePayroll,
        employeeType.salaryStructure,
      ],
    }),
    previewDeductionComponentUpdateImpact: builder.mutation({
      query: ({ id, body, includeEmployees = false }) => ({
        url: `/payroll/deduction-components/${id}/update-impact-preview`,
        method: 'POST',
        params: { includeEmployees },
        body,
      }),
    }),
    previewDeductionComponentDeleteImpact: builder.query({
      query: ({ id, includeEmployees = true, skipCount = 0, maxResultCount = 20 }) => ({
        url: `/payroll/deduction-components/${id}/delete-impact-preview`,
        method: 'GET',
        params: { includeEmployees, skipCount, maxResultCount },
      }),
    }),
    deleteDeductionComponent: builder.mutation({
      query: ({ id, previewHash }) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'DELETE',
        params: { previewHash },
      }),
      invalidatesTags: [
        employeeType.deductionComponents,
        employeeType.employeePayroll,
        employeeType.salaryStructure,
      ],
    }),
    addEarningComponent: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/payroll/earning-components',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.earningComponents],
    }),
    updateEarningComponent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        employeeType.earningComponents,
        employeeType.employeePayroll,
        employeeType.salaryStructure,
      ],
    }),
    previewEarningComponentUpdateImpact: builder.mutation({
      query: ({ id, body, includeEmployees = false }) => ({
        url: `/payroll/earning-components/${id}/update-impact-preview`,
        method: 'POST',
        params: { includeEmployees },
        body,
      }),
    }),
    previewEarningComponentDeleteImpact: builder.query({
      query: ({ id, includeEmployees = true, skipCount = 0, maxResultCount = 20 }) => ({
        url: `/payroll/earning-components/${id}/delete-impact-preview`,
        method: 'GET',
        params: { includeEmployees, skipCount, maxResultCount },
      }),
    }),
    getEarningComponents: builder.query({
      query: ({ page = 1, pageSize = 20, academicYearId, search }) => ({
        url: '/payroll/earning-components',
        method: 'GET',
        params: { page, pageSize, academicYearId, search },
      }),
      providesTags: [employeeType.earningComponents],
    }),
    getEarningComponentById: builder.query({
      query: (id) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.earningComponents],
    }),
    deleteEarningComponent: builder.mutation({
      query: ({ id, previewHash }) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'DELETE',
        params: { previewHash },
      }),
      invalidatesTags: [
        employeeType.earningComponents,
        employeeType.employeePayroll,
        employeeType.salaryStructure,
      ],
    }),
    saveDayCalculationSettings: builder.mutation({
      query: ({ body, academicYearId }) => ({
        url: '/payroll/day-calculation',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
    }),
  }),
});

export const {
  useAddDeductionComponentMutation,
  useAddEarningComponentMutation,
  useUpdateDeductionComponentMutation,
  useUpdateEarningComponentMutation,
  usePreviewDeductionComponentUpdateImpactMutation,
  usePreviewEarningComponentUpdateImpactMutation,
  usePreviewDeductionComponentDeleteImpactQuery,
  usePreviewEarningComponentDeleteImpactQuery,
  useGetDeductionComponentsQuery,
  useGetEarningComponentsQuery,
  useGetDeductionComponentByIdQuery,
  useGetEarningComponentByIdQuery,
  useDeleteDeductionComponentMutation,
  useDeleteEarningComponentMutation,
  useSaveDayCalculationSettingsMutation,
} = employeePayrollApi;
