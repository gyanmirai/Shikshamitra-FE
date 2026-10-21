import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';

import type { ReportOptions, ReportDefinition } from './types';

export function canReadReport(definition: ReportDefinition, permissions: GrantedPermission[]): boolean {
  return hasGrantedPermission(permissions, 'InstituteSetup.Reports.View') &&
    Boolean(definition.requiredPermissions?.length) && definition.requiredPermissions.every((name) => hasGrantedPermission(permissions, name));
}

export function permittedReportOptions(options: ReportOptions | undefined, permissions: GrantedPermission[]): ReportOptions | undefined {
  return options && { ...options, reportTypes: options.reportTypes.filter((definition) => canReadReport(definition, permissions)) };
}
