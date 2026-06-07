import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from '../hr/employeeApi';

export const runPayrollApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getRunPayrollPreview: builder.query({
      query: ({ month, academicYearId, page, pageSize, forceRefresh }) => ({
        url: '/payroll/run',
        method: 'GET',
        params: {
          month,
          ...(academicYearId ? { academicYearId } : {}),
          ...(page !== undefined ? { page } : {}),
          ...(pageSize !== undefined ? { pageSize } : {}),
          ...(forceRefresh !== undefined ? { forceRefresh } : {}),
        },
      }),
      providesTags: [employeeType.runPayroll],
    }),

    getRunPayrollReadiness: builder.query({
      query: ({ month, academicYearId }) => ({
        url: '/payroll/run/readiness',
        method: 'GET',
        params: { month, ...(academicYearId ? { academicYearId } : {}) },
      }),
      providesTags: [employeeType.runPayroll],
    }),

    generateAndLockPayroll: builder.mutation({
      query: ({ month, academicYearId, employeeIds }) => ({
        url: `/payroll/run`,
        method: 'POST',
        body: { month, academicYearId, employeeIds },
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    markPayrollReviewed: builder.mutation({
      query: ({ month, academicYearId, employeeIds }) => ({
        url: `/payroll/run/reviews`,
        method: 'POST',
        body: { month, academicYearId, employeeIds },
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    unmarkPayrollReviewed: builder.mutation({
      query: ({ month, academicYearId, employeeIds }) => ({
        url: `/payroll/run/reviews`,
        method: 'DELETE',
        body: { month, academicYearId, employeeIds },
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    getPayrollAdjustments: builder.query({
      query: ({ month, academicYearId, employeeId }) => ({
        url: '/payroll/run/adjustments',
        method: 'GET',
        params: {
          month,
          ...(academicYearId ? { academicYearId } : {}),
          ...(employeeId ? { employeeId } : {}),
        },
      }),
      providesTags: [employeeType.runPayroll],
    }),

    createPayrollAdjustment: builder.mutation({
      query: (body) => ({
        url: '/payroll/run/adjustments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    updatePayrollAdjustment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payroll/run/adjustments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    deletePayrollAdjustment: builder.mutation({
      query: (id) => ({
        url: `/payroll/run/adjustments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    getEmployeeSalarySlip: builder.query({
      query: (params) => ({
        url: '/payroll/salary-slips',
        method: 'GET',
        params,
      }),
      providesTags: [employeeType.salarySlip],
    }),

    getEmployeeSalarySlipPdf: builder.query({
      query: (params) => ({
        url: '/payroll/salary-slips/pdf',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: [employeeType.salarySlip],
    }),

    getEmployeeSalarySlipPreviewPdf: builder.query({
      query: (params) => ({
        url: '/payroll/salary-slips/pdf-preview',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: [employeeType.salarySlip],
    }),
  }),
});

export const {
  useGetRunPayrollPreviewQuery,
  useGetRunPayrollReadinessQuery,
  useLazyGetRunPayrollPreviewQuery,
  useGenerateAndLockPayrollMutation,
  useMarkPayrollReviewedMutation,
  useUnmarkPayrollReviewedMutation,
  useCreatePayrollAdjustmentMutation,
  useUpdatePayrollAdjustmentMutation,
  useDeletePayrollAdjustmentMutation,
  useGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipPdfQuery,
  useLazyGetEmployeeSalarySlipPreviewPdfQuery,
} = runPayrollApi;
