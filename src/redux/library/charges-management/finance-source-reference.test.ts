import { it, expect } from 'vitest';

import { financeSourceFromAssessment } from './finance-source-reference';

it('uses the server assessment ID and exact version instead of its borrower ID', () => {
  const detail = {
    id: 'assessment-id',
    sourceVersion: 'server-version/+?=',
    memberId: 'student-id',
  };

  expect(financeSourceFromAssessment(detail)).toEqual({
    kind: 1,
    sourceId: 'assessment-id',
    sourceVersion: 'server-version/+?=',
  });
});

it.each([
  { memberId: 'student-id', sourceVersion: 'version' },
  { id: 'assessment-id', memberId: 'student-id' },
  { id: 'assessment-id', sourceVersion: '  ', memberId: 'student-id' },
  { id: '', sourceVersion: 'version', memberId: 'student-id' },
])('blocks the handoff without a server-issued assessment reference: %o', (detail) => {
  expect(financeSourceFromAssessment(detail)).toBeNull();
});
