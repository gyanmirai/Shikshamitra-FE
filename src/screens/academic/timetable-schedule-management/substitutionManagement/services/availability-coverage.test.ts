import { it, expect, describe } from 'vitest';

import { getAvailabilityCoverageState } from './availability-coverage';

describe('getAvailabilityCoverageState', () => {
  it('keeps the create action enabled while any lecture remains uncovered', () => {
    expect(
      getAvailabilityCoverageState({
        affectedLectureCount: 2,
        coveredLectureCount: 1,
        uncoveredLectureCount: 1,
        canCreateSubstitution: true,
        activeSubstitutionStatuses: ['Acknowledged'],
      })
    ).toMatchObject({
      coverageLabel: '1/2 Covered',
      actionLabel: 'Create substitution',
      canCreate: true,
    });
  });

  it('returns Covered only when every affected lecture is covered', () => {
    expect(
      getAvailabilityCoverageState({
        affectedLectureCount: 2,
        coveredLectureCount: 2,
        uncoveredLectureCount: 0,
        canCreateSubstitution: false,
        activeSubstitutionStatuses: ['Acknowledged'],
      })
    ).toMatchObject({
      coverageLabel: '2/2 Covered',
      actionLabel: 'Covered',
      canCreate: false,
    });
  });

  it('falls back to active substitution ids for older API responses', () => {
    expect(
      getAvailabilityCoverageState({
        affectedLectureCount: 2,
        activeSubstitutionIds: ['substitution-1'],
        activeSubstitutionStatuses: ['Acknowledged'],
      })
    ).toMatchObject({
      coverageLabel: '1/2 Covered',
      canCreate: true,
    });
  });

  it('keeps an uncovered past lecture non-actionable', () => {
    expect(
      getAvailabilityCoverageState({
        affectedLectureCount: 2,
        coveredLectureCount: 1,
        uncoveredLectureCount: 1,
        canCreateSubstitution: false,
      })
    ).toMatchObject({
      coverageLabel: '1/2 Covered',
      actionLabel: '1 Uncovered',
      canCreate: false,
    });
  });
});
