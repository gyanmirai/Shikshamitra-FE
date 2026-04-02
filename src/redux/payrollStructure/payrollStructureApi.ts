import { api } from 'src/redux/service';
import { payrollStructureType } from 'src/redux/tagTypes';

export const payrollStructureApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayrollStructures: builder.query({
      query: () => ({ url: '/app/payroll-structure' }),
      providesTags: [payrollStructureType.payrollStructure],
    }),
    addPayrollStructure: builder.mutation({
      query: (body) => ({
        url: '/app/payroll-structure',
        method: 'POST',
        body,
      }),
      invalidatesTags: [payrollStructureType.payrollStructure],
    }),
    updatePayrollStructure: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/payroll-structure/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [payrollStructureType.payrollStructure],
    }),
    deletePayrollStructure: builder.mutation({
      query: (id) => ({
        url: `/app/payroll-structure/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [payrollStructureType.payrollStructure],
    }),
    getPayrollStructureByOrganization: builder.query({
      query: (organization) => ({
        url: `/education-medium-stage/${organization}/payroll-structure`,
      }),
      providesTags: [payrollStructureType.payrollStructure],
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
