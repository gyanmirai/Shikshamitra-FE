import { it, expect } from 'vitest';

import { withAdmissionCounsellorFilter } from './admission-application-filters';

it('keeps other application filters when opening a counsellor queue', () => {
  expect(withAdmissionCounsellorFilter('status=7&search=Anya', 'counsellor-1'))
    .toBe('?status=7&search=Anya&counsellor=counsellor-1');
});

it('clears only the counsellor filter without losing the current view', () => {
  expect(withAdmissionCounsellorFilter('status=7&counsellor=counsellor-1', ''))
    .toBe('?status=7');
});
