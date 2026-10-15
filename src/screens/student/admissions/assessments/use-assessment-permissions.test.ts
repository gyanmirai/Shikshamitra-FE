import { it, expect, describe } from 'vitest';

import {
  getAssessmentPermissions,
  canAdvanceAssessmentApplications,
} from './use-assessment-permissions';

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

describe('assessment application continuation permissions', () => {
  it('allows the canonical application Add capability together with View', () => {
    expect(
      canAdvanceAssessmentApplications([
        { name: 'Students.Admissions.Applications.View', isGranted: true },
        { name: 'Students.Admissions.Applications.Add', isGranted: true },
      ])
    ).toBe(true);
  });
  it('rejects the fabricated Advance name even with application View', () => {
    expect(
      canAdvanceAssessmentApplications([
        { name: 'Students.Admissions.Applications.View', isGranted: true },
        { name: 'Students.Admissions.Applications.Advance', isGranted: true },
      ])
    ).toBe(false);
  });
  it('requires both current View and Add grants, including revocation', () => {
    expect(
      canAdvanceAssessmentApplications([
        { name: 'Students.Admissions.Applications.Add', isGranted: true },
      ])
    ).toBe(false);
    expect(
      canAdvanceAssessmentApplications([
        { name: 'Students.Admissions.Applications.View', isGranted: true },
        { name: 'Students.Admissions.Applications.Add', isGranted: false },
      ])
    ).toBe(false);
    expect(canAdvanceAssessmentApplications(undefined)).toBe(false);
  });
});
