import type { IAccessLogsManagementSecurityDenyFormValues } from './access-logs-management-security-interface';

export function getInitialDenyFormValues(): IAccessLogsManagementSecurityDenyFormValues {
  return {
    notes: '',
  };
}
