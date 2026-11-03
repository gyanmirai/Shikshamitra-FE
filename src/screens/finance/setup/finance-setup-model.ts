import type { SetupFlowStepState } from 'src/components/setup-flow';
import type { FinanceSetupSettingStatus } from 'src/redux/finance/setup/types';

import { financePaths } from 'src/constants/finance-menu';

import { financeSetupStages, financeSetupSettings } from './finance-setup-catalog';

import type { FinanceSetupPosition } from './finance-setup-catalog';

export function getFinanceSetupPosition(
  stage: string | null,
  setting: string | null,
  allowedKeys?: string[]
): FinanceSetupPosition {
  const current = financeSetupStages.find((item) => item.key === stage) ?? financeSetupStages[0];
  const settings = financeSetupSettings.filter(
    (item) => item.stage === current.key && (!allowedKeys || allowedKeys.includes(item.key))
  );
  return {
    stage: current.key,
    setting: settings.find((item) => item.key === setting)?.key ?? settings[0]?.key ?? null,
  };
}

export function safeFinanceReturnTo(path: string | null) {
  if (
    !path?.startsWith('/finance/') ||
    path.includes('\\') ||
    Array.from(path).some((character) => character.charCodeAt(0) <= 32)
  )
    return financePaths.dashboard;
  try {
    const url = new URL(path, 'https://school.invalid');
    if (
      url.origin !== 'https://school.invalid' ||
      !url.pathname.startsWith('/finance/') ||
      /^\/finance\/setup(?:\/|$)/.test(decodeURIComponent(url.pathname))
    )
      return financePaths.dashboard;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return financePaths.dashboard;
  }
}

export function getFinanceSettingLabel(
  state?: FinanceSetupSettingStatus['configurationState'],
  deferred = false
) {
  if (!state || state === 'unavailable') return 'Unable to check';
  if (state === 'configured') return 'Active configuration available';
  return deferred ? 'Deferred' : 'Needs setup';
}

export function getFinanceSetupStepStates(
  settings: FinanceSetupSettingStatus[],
  deferred: string[],
  reviewedAt: string | null
) {
  const result: Record<string, SetupFlowStepState> = {};
  financeSetupStages.forEach(({ key }) => {
    const visible = financeSetupSettings
      .filter((item) => item.stage === key)
      .map((item) => settings.find((status) => status.key === item.key))
      .filter((item) => item?.canView);
    if (visible.length && visible.every((item) => item?.configurationState === 'configured'))
      result[key] = 'complete';
    else if (
      visible.length &&
      visible.every((item) => item?.configurationState === 'empty' && deferred.includes(item.key))
    )
      result[key] = 'deferred';
  });
  if (reviewedAt) result.review = 'complete';
  return result;
}
