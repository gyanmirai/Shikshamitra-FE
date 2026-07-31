import { it, expect, describe } from 'vitest';

import {
  createEnrollmentQueryScopeKey,
  getEnrollmentFilterQueryScope,
} from './enrollment-query-scope';

describe('Enrollment query scope keys', () => {
  it('is stable when object properties are created in a different order', () => {
    const first = createEnrollmentQueryScopeKey({
      academicYearId: 'year-1',
      query: { priority: 2, channel: 1 },
    });
    const second = createEnrollmentQueryScopeKey({
      query: { channel: 1, priority: 2 },
      academicYearId: 'year-1',
    });

    expect(first).toBe(second);
  });

  it.each([
    ['academic year', { academicYearId: 'year-2' }],
    ['academic medium', { academicMediumId: 'medium-2' }],
    ['view', { view: 'board' }],
    ['search', { search: 'Patel' }],
    ['sorting', { sorting: 'ApplicantName ASC' }],
    ['page', { page: 2 }],
    ['data revision', { boardDataRevision: 1 }],
    ['filter', { filters: [{ column: 'priority', value: 2 }] }],
  ])('changes when the %s query scope changes', (_label, change) => {
    const baseline = {
      academicYearId: 'year-1',
      academicMediumId: 'medium-1',
      view: 'list',
      search: '',
      sorting: 'LastActivityTime DESC',
      page: 1,
      boardDataRevision: 0,
      filters: [],
    };

    expect(createEnrollmentQueryScopeKey({ ...baseline, ...change })).not.toBe(
      createEnrollmentQueryScopeKey(baseline)
    );
  });

  it('keeps only server-query filter fields in the selection scope', () => {
    expect(
      getEnrollmentFilterQueryScope([
        {
          column: 'applicantName',
          type: 'contains',
          value: 'Patel',
          valueType: 'string',
          label: 'Applicant',
          displayValue: 'Patel applicants',
        },
      ])
    ).toEqual([
      {
        column: 'applicantName',
        type: 'contains',
        value: 'Patel',
        valueType: 'string',
      },
    ]);
  });
});
