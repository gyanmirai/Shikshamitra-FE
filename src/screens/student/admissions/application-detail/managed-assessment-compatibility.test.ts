import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, expect } from 'vitest';

import { getStageCompletionKind } from './admission-stage-completion';
import { getStageGuidance, canCompleteStageFromProgress } from './application-progress-model';

const stage = (overrides: Partial<AdmissionApplicationStage> = {}): AdmissionApplicationStage => ({
  id: 'stage-1', definitionStageId: 'definition-1', code: 'ASSESSMENT', name: 'Assessment',
  stageType: 2, displayOrder: 1, status: 1, allowManualSkip: false, ...overrides,
});

it.each([
  { stageType: 2, code: 'ASSESSMENT' },
  { stageType: 11, code: 'ENTRANCE_EXAM' },
  { stageType: 11, code: 'ENTRANCE_EXAM_PASSED' },
])('preserves completion behavior for legacy exam stages: %j', (legacy) => {
  expect(getStageCompletionKind(stage(legacy))).toBe('entrance-exam');
  expect(canCompleteStageFromProgress(stage(legacy), 0, true)).toBe(true);
  expect(canCompleteStageFromProgress(stage({ ...legacy, assessmentEnabled: false }), 0, true)).toBe(true);
});

it.each([0, 1, 6] as const)('prevents generic completion bypass for managed assessment at application status %i', (status) => {
  const managed = stage({ assessmentEnabled: true });
  expect(canCompleteStageFromProgress(managed, status, true)).toBe(false);
  expect(getStageGuidance(managed, status)).toContain('Manage the assessment below');
});

it('still respects ordinary stage advancement permission and form completion gates', () => {
  expect(canCompleteStageFromProgress(stage(), 0, false)).toBe(false);
  expect(canCompleteStageFromProgress(stage({ stageType: 1, code: 'FORM' }), 0, true)).toBe(false);
});
