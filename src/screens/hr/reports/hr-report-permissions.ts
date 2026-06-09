export type HrReportPermissions = {
  canView: boolean;
  canBuild: boolean;
  canExport: boolean;
  canSchedule: boolean;
  canManageTemplates: boolean;
  canDelete: boolean;
  canShare: boolean;
};

export const defaultHrReportPermissions: HrReportPermissions = {
  canView: false,
  canBuild: false,
  canExport: false,
  canSchedule: false,
  canManageTemplates: false,
  canDelete: false,
  canShare: false,
};
