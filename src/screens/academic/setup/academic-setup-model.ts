import type { SetupFlowStepState } from 'src/components/setup-flow';
import type { AcademicSetupSettingStatus } from 'src/redux/academic-setup/types';

import { academicSetupStages, academicSetupSettings } from './academic-setup-catalog';

import type { AcademicSetupPosition } from './academic-setup-catalog';

export { academicSetupStages, academicSetupSettings } from './academic-setup-catalog';

export const getAcademicConfigurationSetting = (path: string) =>
  academicSetupSettings.find((setting) => setting.path === path.replace(/\/$/, ''))?.key ?? null;

export function getAcademicSetupEntryDecision(input: {
  eligible: boolean; configuration: boolean; visited?: boolean; failed?: boolean;
}) {
  if (!input.eligible) return 'show';
  if (input.configuration) return 'track';
  if (input.failed) return 'error';
  if (input.visited === undefined) return 'loading';
  return input.visited ? 'show' : 'redirect';
}

export function safeAcademicReturnTo(path: string | null) {
  if (!path?.startsWith('/academic/') || path.startsWith('//')) return '/academic/dashboard';
  try {
    const url = new URL(path, 'https://school.invalid');
    if (!url.pathname.startsWith('/academic/') || /^\/academic\/setup(?:\/|$)/.test(url.pathname)) {
      return '/academic/dashboard';
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/academic/dashboard';
  }
}

export function getAcademicSetupPosition(stage: string, setting: string | null, allowedKeys?: string[]): AcademicSetupPosition {
  const current = academicSetupStages.find((item) => item.key === stage);
  if (!current) return { stage: 'welcome', setting: null };
  const items = academicSetupSettings.filter((item) => item.stage === current.key
    && (!allowedKeys || allowedKeys.includes(item.key)));
  return { stage: current.key, setting: items.find((item) => item.key === setting)?.key ?? items[0]?.key ?? null };
}

export function getAcademicSetupStepStates(
  settings: AcademicSetupSettingStatus[], deferred: string[], reviewedAt: string | null
): Record<string, SetupFlowStepState> {
  const result: Record<string, SetupFlowStepState> = {};
  academicSetupStages.forEach(({ key }) => {
    const items = academicSetupSettings.filter((item) => item.stage === key)
      .map((item) => settings.find((status) => status.key === item.key)).filter((item) => item?.canView);
    if (items.length && items.every((item) => item?.configurationState === 'configured')) result[key] = 'complete';
    else if (items.length && items.every((item) => item && deferred.includes(item.key))) result[key] = 'deferred';
  });
  if (reviewedAt) result.review = 'complete';
  return result;
}
