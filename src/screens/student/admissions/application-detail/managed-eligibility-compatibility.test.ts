import { it, expect } from 'vitest';

import { getStageGuidance, canCompleteStageFromProgress } from './application-progress-model';

it('does not complete retired stage type 3 through the application workspace', () => {
  const stage = {
    id: 'retired',
    definitionStageId: 'definition',
    code: 'RETIRED',
    name: 'Retired stage',
    stageType: 3,
    displayOrder: 1,
    status: 1,
    allowManualSkip: false,
  };
  expect(canCompleteStageFromProgress(stage, 1, true)).toBe(false);
  expect(getStageGuidance(stage, 1)).toContain('no longer supported');
});
