import { it, expect, describe } from 'vitest';

import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';

const columns = [
  { id: 'applicantName', label: 'Applicant', originalId: 'ApplicantName' },
  { id: 'lastActivityTime', label: 'Last activity' },
];

describe('Enrollment workspace table sorting', () => {
  it('hydrates case-insensitive backend sorting into table column state', () => {
    expect(parseEnrollmentTableSorts('ApplicantName ASC, lastActivityTime desc', columns)).toEqual([
      { column: 'applicantName', direction: 'asc', originalId: 'ApplicantName' },
    ]);
  });

  it('ignores malformed and unavailable backend sort fields', () => {
    expect(parseEnrollmentTableSorts('unknown asc, ApplicantName sideways', columns)).toEqual([]);
  });

  it('serializes the one sort field supported by Enrollment backends', () => {
    expect(
      serializeEnrollmentTableSort([
        { column: 'applicantName', direction: 'asc', originalId: 'ApplicantName' },
        { column: 'lastActivityTime', direction: 'desc' },
      ])
    ).toBe('ApplicantName asc');
  });
});
