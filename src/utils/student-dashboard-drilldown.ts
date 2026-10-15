/** Explicit dashboard presets keep destination queries in the same population as their count. */
export const onboardingDashboardQueues = [
  'unfinished',
  'attention',
  'ready',
  'division',
  'gr-number',
  'roll-number',
  'documents',
  'credentials',
] as const;

export type OnboardingDashboardQueue = (typeof onboardingDashboardQueues)[number];

export function readOnboardingDashboardQueue(
  value: string | null
): OnboardingDashboardQueue | undefined {
  return onboardingDashboardQueues.find((queue) => queue === value);
}

export function readDashboardAcademicScope(params: Pick<URLSearchParams, 'get'>) {
  return {
    academicYearId: params.get('year') || undefined,
    boardId: params.get('board') || undefined,
    mediumId: params.get('medium') || undefined,
    standardId: params.get('class') || undefined,
    divisionId: params.get('division') || undefined,
  };
}
