import { describe, expect, it } from 'vitest';

import { getAssessmentPermissions } from './use-assessment-permissions';

describe('getAssessmentPermissions', () => {
  it('maps backend Add and Delete grants to assessment workflow actions', () => {
    const result = getAssessmentPermissions([
      { name: 'Students.Admissions.Assessments.View', isGranted: true },
      { name: 'Students.Admissions.Assessments.Add', isGranted: true },
      { name: 'Students.Admissions.Assessments.Delete', isGranted: true },
    ]);

    expect(result).toEqual({
      view: true,
      manageSessions: true,
      book: true,
      attendance: true,
      results: true,
      review: true,
      waive: true,
    });
  });

  it('does not treat unsupported action aliases as grants', () => {
    const result = getAssessmentPermissions([
      { name: 'Students.Admissions.Assessments.ManageSessions', isGranted: true },
      { name: 'Students.Admissions.Assessments.Book', isGranted: true },
    ]);

    expect(result.manageSessions).toBe(false);
    expect(result.book).toBe(false);
    expect(result.waive).toBe(false);
  });
});
