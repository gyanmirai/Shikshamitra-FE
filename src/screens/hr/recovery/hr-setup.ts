import type { GrantedPermission } from 'src/utils/permissions';

import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission, hasNavigationPermission } from 'src/utils/permissions';

import { staffPayrollEditHref } from '../employee/payroll-profile-utils';

import type { HrSetup } from './hr-failure';

const setups: Record<HrSetup, { label: string; href: string; grants: string[]; route: string }> = {
  staffPayroll: {
    label: 'Review statutory registration',
    href: hrPaths.employee.list,
    route: hrPermissions.employee.list,
    grants: [
      hrPermissions.payroll.compensationRevisionActions.view,
      hrPermissions.payroll.compensationRevisionActions.manage,
      hrPermissions.payroll.settings.statutorySchemes,
      hrPermissions.payroll.settings.statutorySchemeActions.manageEnrollment,
    ],
  },
  attendance: {
    label: 'Open attendance',
    href: hrPaths.attendance.markAttendance,
    route: hrPermissions.attendance.markAttendance,
    grants: [`${hrPermissions.attendance.markAttendance}.View`],
  },
  salary: {
    label: 'Review staff salary setup',
    href: hrPaths.payroll.structure,
    route: hrPermissions.payroll.root,
    grants: [
      hrPermissions.payroll.compensationRevisionActions.view,
      hrPermissions.payroll.compensationRevisionActions.manage,
    ],
  },
  templates: {
    label: 'Review salary templates',
    href: hrPaths.payroll.settings.salaryTemplates,
    route: hrPermissions.payroll.root,
    grants: [hrPermissions.payroll.settings.salaryTemplateActions.view],
  },
  leave: {
    label: 'Review leave policies',
    href: hrPaths.policies.leavePolicies,
    route: hrPermissions.policies.leavePolicies,
    grants: ['HR.LeaveManagement.Setting.LeavePolicy.View'],
  },
  statutory: {
    label: 'Review statutory setup',
    href: hrPaths.payroll.settings.statutorySchemes,
    route: hrPermissions.payroll.root,
    grants: [hrPermissions.payroll.settings.statutorySchemes],
  },
  assignments: {
    label: 'Review policy assignments',
    href: hrPaths.policies.assignments,
    route: hrPermissions.policies.assignments,
    grants: [hrPermissions.policyActions.assign],
  },
  pf: {
    label: 'Review PF rules',
    href: hrPaths.payroll.settings.pfRule,
    route: hrPermissions.payroll.root,
    grants: [`${hrPermissions.payroll.settings.pfRule}.View`],
  },
  components: {
    label: 'Review salary components',
    href: hrPaths.payroll.settings.earningComponents,
    route: hrPermissions.payroll.root,
    grants: [`${hrPermissions.payroll.settings.earningComponents}.View`],
  },
};

/** Fixed local destinations only: no backend-provided URL or unsaved values in the URL. */
export function hrSetupAction(
  setup: HrSetup,
  permissions: GrantedPermission[],
  ready = true,
  employeeId?: string
) {
  if (setup === 'staffPayroll' && !employeeId) return null;
  const action = setups[setup];
  return ready &&
    hasGrantedPermission(permissions, hrPermissions.root) &&
    (setup !== 'staffPayroll' ||
      hasGrantedPermission(permissions, `${hrPermissions.employee.list}.Edit`)) &&
    (setup !== 'staffPayroll' ||
      hasNavigationPermission(permissions, hrPermissions.employee.root)) &&
    (setup !== 'attendance' ||
      hasNavigationPermission(permissions, hrPermissions.attendance.root)) &&
    (!['leave', 'assignments'].includes(setup) ||
      hasNavigationPermission(permissions, hrPermissions.policies.root)) &&
    (!['templates', 'statutory', 'pf', 'components'].includes(setup) ||
      hasNavigationPermission(permissions, hrPermissions.payroll.settings.root)) &&
    hasNavigationPermission(permissions, action.route) &&
    hasGrantedPermission(permissions, action.grants)
    ? {
        label: action.label,
        href: setup === 'staffPayroll' ? staffPayrollEditHref(employeeId!) : action.href,
      }
    : null;
}
