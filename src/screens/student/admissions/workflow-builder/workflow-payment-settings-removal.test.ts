import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect } from 'vitest';

import { normalizeStageConfiguration } from './workflow-stage-configuration';
import { getWorkflowStageCompletionDescription } from './components/workflow-stage-completion-summary';

it.each([
  { version: 1, paymentRule: 'full', allowCollectionLater: false },
  { version: 99, paymentRule: 'unsupported' },
  null,
])('removes retired Payment settings without losing extensions: %j', (paymentCompletion) => {
  const stage = {
    stageType: 4,
    allowManualSkip: true,
    configurationJson: JSON.stringify({
      payment: { amount: 1000 },
      paymentCompletion,
      extension: { keep: true },
    }),
  } as AdmissionWorkflowStage;
  const normalized = normalizeStageConfiguration(stage);
  expect(JSON.parse(normalized.configurationJson!)).toEqual({ extension: { keep: true } });
  expect(normalized.allowManualSkip).toBe(false);
  expect(getWorkflowStageCompletionDescription(stage)).toContain(
    'defer collection to Onboarding with a reason'
  );
  expect(getWorkflowStageCompletionDescription(stage)).not.toContain('entire');
});

it('does not retain an empty Payment configuration after removing retired settings', () => {
  const stage = {
    stageType: 4,
    configurationJson: '{"paymentCompletion":{"paymentRule":"full"}}',
  } as AdmissionWorkflowStage;
  expect(normalizeStageConfiguration(stage).configurationJson).toBeUndefined();
});
