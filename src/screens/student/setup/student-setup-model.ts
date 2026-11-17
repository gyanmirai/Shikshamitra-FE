import type { GrantedPermission } from 'src/utils/permissions';
import type { SetupFlowStepState } from 'src/components/setup-flow';
import type { StudentSetupSettingStatus } from 'src/redux/student/setup/types';

import { hasGrantedPermission } from 'src/utils/permissions';
import { studentPaths, studentPermissions, studentSetupViewPermissions } from 'src/constants/student-menu';

import { studentSetupStages, studentSetupSettings, studentSetupWorkflows } from './student-setup-catalog';

import type { StudentSetupPosition } from './student-setup-catalog';

export { studentSetupStages, studentSetupSettings } from './student-setup-catalog';

export const canAccessStudentSetup = (permissions: GrantedPermission[]) =>
  hasGrantedPermission(permissions, studentPermissions.root) && hasGrantedPermission(permissions, studentSetupViewPermissions);

export function getStudentConfigurationSetting(pathname: string, search = '') {
  const path = pathname.replace(/\/$/, '');
  if (path === studentPaths.onboarding.settings) {
    return new URLSearchParams(search).get('tab') === 'roll-number' ? 'roll-number' : 'gr-number';
  }
  return studentSetupSettings.find((item) => {
    const route = item.path.split('?')[0];
    return path === route || ((item.key === 'admission-stages' || item.key === 'admission-forms' || item.key === 'records-policy')
      && path.startsWith(`${route}/`));
  })?.key ?? null;
}

export function safeStudentReturnTo(value: string | null) {
  if (!value?.startsWith('/student/') || value.includes('\\') || /\s/.test(value)) return studentPaths.dashboard;
  try {
    const url = new URL(value, 'https://school.invalid');
    const decoded = decodeURIComponent(url.pathname);
    if (url.origin !== 'https://school.invalid' || !url.pathname.startsWith('/student/') ||
      !decoded.startsWith('/student/') || decoded.includes('\\') || /\s/.test(decoded) ||
      decoded.split('/').some((part) => part === '..' || part === '.') ||
      /^\/student\/setup(?:\/|$)/.test(decoded)) return studentPaths.dashboard;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return studentPaths.dashboard; }
}

export function permittedStudentReturnTo(value: string | null, permissions: GrantedPermission[]) {
  const destinations = [
    { path: studentPaths.dashboard, permission: studentPermissions.dashboard },
    ...studentSetupWorkflows, ...studentSetupSettings,
    { path: studentPaths.enrollment.applications, permission: studentPermissions.enrollment.applications },
    { path: studentPaths.enrollment.assessments, permission: studentPermissions.enrollment.assessments },
  ];
  const permitted = destinations.filter((item) => hasGrantedPermission(permissions, item.permission));
  const safe = safeStudentReturnTo(value);
  const path = safe.split(/[?#]/)[0];
  if (safe === value && permitted.some((item) => path === item.path.split('?')[0] || path.startsWith(`${item.path.split('?')[0]}/`))) return safe;
  return permitted[0]?.path ?? '/dashboard';
}

export function getStudentSetupPosition(stage: string | null, setting: string | null, allowedKeys?: string[]): StudentSetupPosition {
  const current = studentSetupStages.find((item) => item.key === stage) ?? studentSetupStages[0];
  const settings = studentSetupSettings.filter((item) => item.stage === current.key && (!allowedKeys || allowedKeys.includes(item.key)));
  return { stage: current.key, setting: settings.find((item) => item.key === setting)?.key ?? settings[0]?.key ?? null };
}

export function nextStudentSetupPosition(position: StudentSetupPosition, allowedKeys: string[], backwards = false): StudentSetupPosition {
  const items = studentSetupSettings.filter((item) => item.stage === position.stage && allowedKeys.includes(item.key));
  const index = items.findIndex((item) => item.key === position.setting);
  const sibling = items[index + (backwards ? -1 : 1)];
  if (index >= 0 && sibling) return { stage: sibling.stage, setting: sibling.key };
  const stageIndex = studentSetupStages.findIndex((item) => item.key === position.stage);
  const stage = studentSetupStages[Math.max(0, Math.min(studentSetupStages.length - 1, stageIndex + (backwards ? -1 : 1)))].key;
  const target = studentSetupSettings.filter((item) => item.stage === stage && allowedKeys.includes(item.key));
  return { stage, setting: (backwards ? target.at(-1) : target[0])?.key ?? null };
}

export function getStudentSetupStepStates(settings: StudentSetupSettingStatus[], deferred: string[], reviewedAt: string | null) {
  const states: Record<string, SetupFlowStepState> = {};
  studentSetupStages.forEach(({ key }) => {
    const visible = studentSetupSettings.filter((item) => item.stage === key)
      .map((item) => settings.find((status) => status.key === item.key)).filter((item) => item?.canView);
    if (visible.length && visible.every((item) => item?.configurationState === 'configured')) states[key] = 'complete';
    else if (visible.length && visible.every((item) => item?.configurationState === 'empty' && deferred.includes(item.key))) states[key] = 'deferred';
  });
  if (reviewedAt) states.review = 'complete';
  return states;
}

export function studentSetupStatusLabel(status: StudentSetupSettingStatus | undefined, deferred = false) {
  if (!status || status.configurationState === 'unavailable') return 'Unavailable';
  if (status.configurationState === 'context-required') return 'Choose the academic context';
  if (status.configurationState === 'configured') return status.configurationSource === 'school-default'
    ? 'Using school defaults' : status.configurationSource === 'school' ? 'Using school configuration' : 'Configured';
  return deferred ? 'Deferred' : 'Not configured';
}
