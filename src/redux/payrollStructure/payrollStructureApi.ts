import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const payrollStructureApi = createApi({
  reducerPath: 'payrollStructureApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['PayrollStructure'],
  endpoints: (builder) => ({
    getPayrollStructures: builder.query({
      query: () => ({ url: '/app/payroll-structure' }),
      providesTags: ['PayrollStructure'],
    }),
    addPayrollStructure: builder.mutation({
      query: (body) => ({
        url: '/app/payroll-structure',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['PayrollStructure'],
    }),
    updatePayrollStructure: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/payroll-structure/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['PayrollStructure'],
    }),
    deletePayrollStructure: builder.mutation({
      query: (id) => ({
        url: `/app/payroll-structure/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PayrollStructure'],
    }),
    getPayrollStructureByOrganization: builder.query({
      query: (organization) => ({
        url: `/education-medium-stage/${organization}/payroll-structure`,
      }),
      providesTags: ['PayrollStructure'],
    }),
  }),
});

export const {
  useGetPayrollStructuresQuery,
  useAddPayrollStructureMutation,
  useDeletePayrollStructureMutation,
  useUpdatePayrollStructureMutation,
  useGetPayrollStructureByOrganizationQuery,
} = payrollStructureApi;
