import { employeeApi } from '../employee/employeeApi';

export const employeeSalaryStructureApi = employeeApi.injectEndpoints({
  // tagTypes: ['Deduction-Components', 'Employee-Payroll', 'Earning-Components'],
  endpoints: (builder) => ({
    getEmployeeSalaryStructure: builder.query({
      query: ({ id }) => ({
        url: `/payroll/employees/${id}/salary-structure`,
        method: 'GET',
      }),
      providesTags: ['Salary-Structure'],
    }),
    updateEmployeeSalaryStructure: builder.mutation({
      query: ({ id, data }) => ({
        url: `/payroll/employees/${id}/salary-structure`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Salary-Structure'],
    }),
  }),
});

export const { useGetEmployeeSalaryStructureQuery, useUpdateEmployeeSalaryStructureMutation } =
  employeeSalaryStructureApi;
