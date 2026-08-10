import { it, expect, describe } from 'vitest';
import { AdmissionCrmRouteType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  formatEvidenceCode,
  getApplicantRouteFields,
  emptyApplicantRouteValues,
  buildRouteEvidenceReferences,
  isApplicantRouteInputComplete,
} from './applicant-route-requirements';

describe('applicant route requirements', () => {
  it('shows only fields required by the selected pathway', () => {
    expect(
      getApplicantRouteFields(AdmissionCrmRouteType.SiblingPriority).map((field) => field.key)
    ).toEqual(['relatedStudentId']);
    expect(
      getApplicantRouteFields(AdmissionCrmRouteType.Lateral).map((field) => field.key)
    ).toEqual(['previousSchool', 'previousBoard', 'lastClass']);
    expect(getApplicantRouteFields(AdmissionCrmRouteType.Fresh)).toEqual([]);
  });

  it('builds one coded reference for each configured evidence item', () => {
    expect(
      buildRouteEvidenceReferences(
        ['previous_school_record', 'TRANSFER_CERTIFICATE', 'previous_school_record'],
        {
          PREVIOUS_SCHOOL_RECORD: 'DOC-101',
          TRANSFER_CERTIFICATE: 'TC-42',
        }
      )
    ).toEqual(['PREVIOUS_SCHOOL_RECORD:DOC-101', 'TRANSFER_CERTIFICATE:TC-42']);
  });

  it('requires route data and every configured evidence reference before preview', () => {
    const values = emptyApplicantRouteValues();
    values.previousSchool = 'Old School';
    values.previousBoard = 'State Board';
    values.lastClass = 'Class 3';

    expect(
      isApplicantRouteInputComplete(
        AdmissionCrmRouteType.Lateral,
        values,
        ['TRANSFER_CERTIFICATE'],
        {}
      )
    ).toBe(false);
    expect(
      isApplicantRouteInputComplete(
        AdmissionCrmRouteType.Lateral,
        values,
        ['TRANSFER_CERTIFICATE'],
        { TRANSFER_CERTIFICATE: 'TC-42' }
      )
    ).toBe(true);
  });

  it('formats evidence codes for staff-facing labels', () => {
    expect(formatEvidenceCode('SIBLING_RELATIONSHIP')).toBe('Sibling Relationship');
  });
});
