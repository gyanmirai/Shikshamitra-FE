import { it, expect } from 'vitest';

import { buildUpdateChargePayload } from './library-adapters';

it('sends the exact actual source version saved with the opened assessment form', () => {
  const version = ' exact opaque assessment version ';

  expect(
    buildUpdateChargePayload({
      amount: '100.75',
      sourceVersion: version,
      schoolDueDate: '2026-11-30',
      reason: 'Reviewed the current persisted assessment before amendment.',
    })
  ).toEqual({
    amount: 100.75,
    expectedSourceVersion: version,
    schoolDueDate: '2026-11-30',
    remarks: 'Reviewed the current persisted assessment before amendment.',
  });
});

it('does not turn an assessment amendment into a change of source or a local settlement', () => {
  const version = 'another-exact-version';

  expect(
    buildUpdateChargePayload({
      amount: '100.75',
      sourceVersion: version,
      schoolDueDate: '2026-11-30',
      reason: 'Corrected the amount against the unchanged saved source.',
      memberId: 'different-person',
      chargeCategory: 'different-category',
      bookIssueId: 'different-loan',
      academicYearId: 'different-assessment-year',
      schoolChargeDate: '2027-01-01',
      paymentStatus: 1,
      paidDate: '2026-11-18T04:30:00Z',
    })
  ).toEqual({
    amount: 100.75,
    expectedSourceVersion: version,
    schoolDueDate: '2026-11-30',
    remarks: 'Corrected the amount against the unchanged saved source.',
  });
});
