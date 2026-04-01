import { employeeApi } from './employeeApi';
import { employeeType } from 'src/redux/tagTypes';


export interface EmployeeSalaryComponent {
  id?: string | null;
  componentId?: string | null;
  name: string;
  amount?: number | null;
  isFixed?: boolean;
  isTemp: boolean;
  applicableMonth: string;
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
