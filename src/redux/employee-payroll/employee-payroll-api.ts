import { employeeApi } from '../employee/employeeApi';

export const employeePayrollApi = employeeApi.injectEndpoints({
  // tagTypes: ['Deduction-Components', 'Employee-Payroll', 'Earning-Components'],
  endpoints: (builder) => ({
    getDeductionComponents: builder.query({
      query: () => ({
        url: '/payroll/deduction-components',
        method: 'GET',
      }),
      providesTags: ['Deduction-Components'],
    }),
    addDeductionComponent: builder.mutation({
      query: (body) => ({
        url: '/payroll/deduction-components',
        method: 'POST',
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
      query: (body) => ({
        url: '/payroll/earning-components',
        method: 'POST',
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
      query: () => ({
        url: '/payroll/earning-components',
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
  }),
});

export const {
  useAddDeductionComponentMutation,
  useAddEarningComponentMutation,
  useUpdateDeductionComponentMutation,
  useUpdateEarningComponentMutation,
  useGetDeductionComponentsQuery,
  useGetEarningComponentsQuery,
  useDeleteDeductionComponentMutation,
  useDeleteEarningComponentMutation,
} = employeePayrollApi;
