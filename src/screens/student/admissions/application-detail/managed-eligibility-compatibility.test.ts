import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, expect } from 'vitest';

import { getStageGuidance, canCompleteStageFromProgress } from './application-progress-model';

const stage: AdmissionApplicationStage = {
  id: 'eligibility-1',
  definitionStageId: 'definition-1',
  code: 'ELIGIBILITY',
  name: 'Eligibility',
  stageType: 3,
  displayOrder: 2,
  status: 1,
  allowManualSkip: false,
};

it('preserves legacy eligibility completion unless the server explicitly enables managed checks', () => {
  expect(canCompleteStageFromProgress(stage, 1, true)).toBe(true);
  expect(canCompleteStageFromProgress({ ...stage, eligibilityEnabled: false }, 1, true)).toBe(true);
  expect(canCompleteStageFromProgress({ ...stage, eligibilityEnabled: true }, 1, true)).toBe(false);
  expect(getStageGuidance({ ...stage, eligibilityEnabled: true }, 1)).toMatch(
    /eligibility results/
  );
});
