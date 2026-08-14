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
  semanticType?: string;
  statutoryRuleId?: string | null;
}

export interface EmployeeSalaryStructureResponse {
  earningComponents: EmployeeSalaryComponent[];
  deductionComponents: EmployeeSalaryComponent[];
  pfRuleId?: string | null;
  quotedSalaryBasis?: string | null;
  quotedMonthlyAmount?: number | null;
  sourceSalaryTemplateId?: string | null;
  sourceSalaryTemplateVersionId?: string | null;
  sourceSalaryTemplateVersion?: number | null;
  salaryGeneratedAt?: string | null;
  wasModifiedAfterGeneration?: boolean;
}

export interface UpdateEmployeeSalaryStructureRequest {
  earningComponents: EmployeeSalaryComponent[];
  deductionComponents: EmployeeSalaryComponent[];
  pfRuleId?: string | null;
  quotedSalaryBasis?: string | null;
  quotedMonthlyAmount?: number | null;
  sourceSalaryTemplateId?: string | null;
  sourceSalaryTemplateVersionId?: string | null;
  sourceSalaryTemplateVersion?: number | null;
  salaryGeneratedAt?: string | null;
  wasModifiedAfterGeneration?: boolean;
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
        body: data,
      }),
      invalidatesTags: [employeeType.salaryStructure],
    }),
  }),
});

export const { useGetEmployeeSalaryStructureQuery, useUpdateEmployeeSalaryStructureMutation } =
  employeeSalaryStructureApi;
