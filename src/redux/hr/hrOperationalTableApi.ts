import { api } from 'src/redux/service';
import { employeeType, shiftManagementType, payrollStructureType } from 'src/redux/tagTypes';

import type { ReportTableCriteria } from './hrReportingWorkspaceApi';

export function operationalTableTags(table: string) {
  if (table.startsWith('hr-policy-') && table !== 'hr-policy-leave')
    return [employeeType.attendanceRule, employeeType.runPayroll, employeeType.salarySlip];
  if (table.startsWith('hr-performance-')) return [employeeType.professionalReview];
  if (table.startsWith('hr-attendance-import')) return [employeeType.attendanceImport];
  switch (table) {
    case 'employee-onboarding-table':
      return [employeeType.employeeApplication];
    case 'hr-document-settings':
      return [employeeType.employeeDocumentConfig];
    case 'hr-employee-documents':
      return [employeeType.employeeDocument, employeeType.employeeDocumentConfig];
    case 'hr-icard-templates':
      return [employeeType.employeeICardTemplate];
    case 'hr-earning-components':
      return [employeeType.earningComponents];
    case 'hr-deduction-components':
      return [employeeType.deductionComponents];
    case 'hr-pf-rules':
      return [employeeType.pf];
    case 'hr-professional-tax':
      return [employeeType.pf];
    case 'hr-shifts':
      return [shiftManagementType.shift];
    case 'hr-policy-leave':
      return [employeeType.employeeLeavePolicy];
    case 'esi-employee-impact':
      return [payrollStructureType.statutoryScheme];
    case 'hr-manual-attendance':
      return [employeeType.attendance];
    case 'hr-salary-documents':
      return [employeeType.salarySlip, employeeType.hrReports];
    case 'payroll-monthly-workbench-table':
    case 'hr-payroll-registration-readiness':
      return [employeeType.runPayroll];
    default:
      return [employeeType.employee];
  }
}

export const hrOperationalTableApi = api.injectEndpoints({
  endpoints: (builder) => ({
    hrOperationalTable: builder.query<
      unknown,
      {
        table: string;
        query: Record<string, unknown>;
        criteria: ReportTableCriteria;
        offset: number;
        size: number;
      }
    >({
      query: (body) => ({ url: '/hr/table-query', method: 'POST', body }),
      // Refresh against the owning mutations without invalidating unrelated module tables.
      providesTags: (_result, _error, { table }) => operationalTableTags(table),
    }),
  }),
});

export const { useHrOperationalTableQuery } = hrOperationalTableApi;
