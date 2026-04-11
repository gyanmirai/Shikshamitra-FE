import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

export interface EmployeeSalaryComponent {
  id?: string | null;
  componentId?: string | null;
  name: string;
  description?: string;
  amount?: number | null;
  isFixed?: boolean;
  isTemp: boolean;
  componentType?: number;
  dependOn?: number;
  applicableMonth?: string;
}

export interface EmployeeSalaryStructureResponse {
  earningComponents: EmployeeSalaryComponent[];
  deductionComponents: EmployeeSalaryComponent[];
}

export interface UpdateEmployeeSalaryStructureRequest {
  earningComponents: EmployeeSalaryComponent[];
  deductionComponents: EmployeeSalaryComponent[];
}

export const employeeSalaryStructureApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeSalaryStructure: builder.query({
      query: ({ employeeId }) => ({
        url: `/payroll/employees/${employeeId}/salary-structure`,
        method: 'GET',
      }),
      providesTags: [employeeType.salaryStructure],
    }),
    updateEmployeeSalaryStructure: builder.mutation({
      query: ({ employeeId, data }) => ({
        url: `/payroll/employees/${employeeId}/salary-structure`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: [employeeType.salaryStructure],
    }),
  }),
});

export const { useGetEmployeeSalaryStructureQuery, useUpdateEmployeeSalaryStructureMutation } =
  employeeSalaryStructureApi;
