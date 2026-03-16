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
      providesTags: ['Deduction-Components'],
    }),
    getDeductionComponentById: builder.query({
      query: (id) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'GET',
      }),
      providesTags: ['Deduction-Components'],
    }),
    addDeductionComponent: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/payroll/deduction-components',
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: ['Deduction-Components'],
    }),
    updateDeductionComponent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Deduction-Components'],
    }),
    deleteDeductionComponent: builder.mutation({
      query: (id) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Deduction-Components'],
    }),
    addEarningComponent: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/payroll/earning-components',
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: ['Earning-Components'],
    }),
    updateEarningComponent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Earning-Components'],
    }),
    getEarningComponents: builder.query({
      query: ({ page = 1, pageSize = 20, academicYearId, search }) => ({
        url: '/payroll/earning-components',
        method: 'GET',
        params: { page, pageSize, academicYearId, search },
      }),
      providesTags: ['Earning-Components'],
    }),
    getEarningComponentById: builder.query({
      query: (id) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'GET',
      }),
      providesTags: ['Earning-Components'],
    }),
    deleteEarningComponent: builder.mutation({
      query: (id) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Earning-Components'],
    }),
    saveDayCalculationSettings: builder.mutation({
      query: ({ body, academicYearId }) => ({
        url: '/payroll/day-calculation',
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
    }),
  }),
});

export const {
  useAddDeductionComponentMutation,
  useAddEarningComponentMutation,
  useUpdateDeductionComponentMutation,
  useUpdateEarningComponentMutation,
  useGetDeductionComponentsQuery,
  useGetEarningComponentsQuery,
  useGetDeductionComponentByIdQuery,
  useGetEarningComponentByIdQuery,
  useDeleteDeductionComponentMutation,
  useDeleteEarningComponentMutation,
  useSaveDayCalculationSettingsMutation,
} = employeePayrollApi;
