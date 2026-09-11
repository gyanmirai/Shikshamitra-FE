import { it, expect } from 'vitest';

import { getStageGuidance, canCompleteStageFromProgress } from './application-progress-model';

const stage = { id: 'seat-1', definitionStageId: 'definition-1', code: 'SEAT', name: 'Seat allocation',
  stageType: 9, displayOrder: 1, status: 1, allowManualSkip: true };

it.each([undefined, false])('preserves basic Seat completion when the managed flag is %s', (seatStageEnabled) => {
  expect(canCompleteStageFromProgress({ ...stage, seatStageEnabled }, 6, true)).toBe(true);
});

it('blocks generic completion and gives specific guidance for managed Seat', () => {
  const managed = { ...stage, seatStageEnabled: true };
  expect(canCompleteStageFromProgress(managed, 6, true)).toBe(false);
  expect(getStageGuidance(managed, 6)).toContain('admission capacity');
});
