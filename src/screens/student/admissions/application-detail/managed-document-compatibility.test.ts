import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, expect } from 'vitest';

import { getStageGuidance, canCompleteStageFromProgress } from './application-progress-model';

const stage: AdmissionApplicationStage = {
  id: 'stage-documents', definitionStageId: 'definition-documents', code: 'DOCUMENTS',
  name: 'Document verification', stageType: 5, displayOrder: 2, status: 1, allowManualSkip: false,
};

it.each([undefined, false])('preserves existing document stage completion when the policy flag is %s', (documentVerificationEnabled) => {
  expect(canCompleteStageFromProgress({ ...stage, documentVerificationEnabled }, 4, true)).toBe(true);
});
it('directs managed document stages to the checklist and hides generic completion', () => {
  const managed = { ...stage, documentVerificationEnabled: true };
  expect(canCompleteStageFromProgress(managed, 4, true)).toBe(false);
  expect(getStageGuidance(managed, 4)).toContain('document checklist');
});
it('preserves the existing advancement permission check', () => {
  expect(canCompleteStageFromProgress(stage, 4, false)).toBe(false);
});
