import { employeeApi } from '../employee/employeeApi';

export const employeeSalaryStructureApi = employeeApi.injectEndpoints({
  // tagTypes: ['Deduction-Components', 'Employee-Payroll', 'Earning-Components'],
  endpoints: (builder) => ({
    getEmployeeSalaryStructure: builder.query({
      query: ({ id }) => ({
        url: `/salary-structure/${id}`,
        method: 'GET',
      }),
      providesTags: ['Salary-Structure'],
    }),
    updateEmployeeSalaryStructure: builder.mutation({
      query: ({ id, data }) => ({
        url: `/salary-structure/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Salary-Structure'],
    }),
  }),
});

export const { useGetEmployeeSalaryStructureQuery, useUpdateEmployeeSalaryStructureMutation } =
  employeeSalaryStructureApi;
