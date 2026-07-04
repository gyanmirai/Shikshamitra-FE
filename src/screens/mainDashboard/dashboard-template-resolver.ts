import {
  DASHBOARD_TEMPLATES,
  type DashboardTemplate,
  DASHBOARD_TEMPLATE_OPTIONS,
} from './dashboard-types';

export type DashboardTemplateMapping = Record<string, DashboardTemplate>;

export const DASHBOARD_TEMPLATE_PRIORITY: DashboardTemplate[] = [
  DASHBOARD_TEMPLATES.leadership,
  DASHBOARD_TEMPLATES.principalAdmin,
  DASHBOARD_TEMPLATES.financeHr,
  DASHBOARD_TEMPLATES.teacher,
  DASHBOARD_TEMPLATES.studentParent,
];

const SEEDED_ROLE_TEMPLATE_MAP: DashboardTemplateMapping = {
  admin: DASHBOARD_TEMPLATES.leadership,
  'super admin': DASHBOARD_TEMPLATES.leadership,
  'super-admin': DASHBOARD_TEMPLATES.leadership,
  director: DASHBOARD_TEMPLATES.leadership,
  owner: DASHBOARD_TEMPLATES.leadership,
  'board member': DASHBOARD_TEMPLATES.leadership,
  principal: DASHBOARD_TEMPLATES.principalAdmin,
  'vice principal': DASHBOARD_TEMPLATES.principalAdmin,
  'administrative manager': DASHBOARD_TEMPLATES.principalAdmin,
  'it administrator': DASHBOARD_TEMPLATES.principalAdmin,
  clerk: DASHBOARD_TEMPLATES.principalAdmin,
  'office assistant': DASHBOARD_TEMPLATES.principalAdmin,
  teacher: DASHBOARD_TEMPLATES.teacher,
  hod: DASHBOARD_TEMPLATES.teacher,
  'head of department': DASHBOARD_TEMPLATES.teacher,
  'academic coordinator': DASHBOARD_TEMPLATES.teacher,
  'class teacher': DASHBOARD_TEMPLATES.teacher,
  'finance officer': DASHBOARD_TEMPLATES.financeHr,
  accountant: DASHBOARD_TEMPLATES.financeHr,
  'hr manager': DASHBOARD_TEMPLATES.financeHr,
  'payroll operator': DASHBOARD_TEMPLATES.financeHr,
  'attendance operator': DASHBOARD_TEMPLATES.financeHr,
  student: DASHBOARD_TEMPLATES.studentParent,
  parent: DASHBOARD_TEMPLATES.studentParent,
  guardian: DASHBOARD_TEMPLATES.studentParent,
  user: DASHBOARD_TEMPLATES.studentParent,
};

export const normalizeDashboardRole = (role: string) =>
  role.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();

export const isDashboardTemplate = (value: unknown): value is DashboardTemplate =>
  typeof value === 'string' &&
  DASHBOARD_TEMPLATE_OPTIONS.some((templateOption) => templateOption.template === value);

export const getSessionRoles = (sessionData: any): string[] => {
  const roleClaim =
    sessionData?.profile?.role ?? sessionData?.profile?.roles ?? sessionData?.profile?.roleNames;

  if (Array.isArray(roleClaim)) {
    return roleClaim.filter((role): role is string => typeof role === 'string' && !!role.trim());
  }

  return typeof roleClaim === 'string' && roleClaim.trim() ? [roleClaim] : [];
};

export const getSessionDashboardTemplate = (sessionData: any): DashboardTemplate | null => {
  const explicitTemplate =
    sessionData?.profile?.dashboardTemplate ?? sessionData?.profile?.dashboard_template;

  return isDashboardTemplate(explicitTemplate) ? explicitTemplate : null;
};

export function resolveDashboardTemplate({
  roles,
  explicitTemplate,
  roleTemplateMap,
  defaultTemplate = DASHBOARD_TEMPLATES.principalAdmin,
}: {
  roles?: string[];
  explicitTemplate?: DashboardTemplate | null;
  roleTemplateMap?: DashboardTemplateMapping;
  defaultTemplate?: DashboardTemplate;
}): DashboardTemplate {
  if (explicitTemplate) {
    return explicitTemplate;
  }

  const normalizedRoleTemplateMap = Object.entries({
    ...SEEDED_ROLE_TEMPLATE_MAP,
    ...roleTemplateMap,
  }).reduce<DashboardTemplateMapping>((acc, [role, template]) => {
    acc[normalizeDashboardRole(role)] = template;
    return acc;
  }, {});

  const matchedTemplates = (roles || [])
    .map((role) => normalizedRoleTemplateMap[normalizeDashboardRole(role)])
    .filter((template): template is DashboardTemplate => Boolean(template));

  if (!matchedTemplates.length) {
    return defaultTemplate;
  }

  return (
    DASHBOARD_TEMPLATE_PRIORITY.find((template) => matchedTemplates.includes(template)) ||
    matchedTemplates[0]
  );
}
