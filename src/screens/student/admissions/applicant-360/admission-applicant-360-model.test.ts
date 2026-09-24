import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { it, expect, describe } from 'vitest';

import {
  getCurrentStage,
  getApplicantName,
  getPrimaryApplication,
  getActivityPresentation,
  getApplicantJourneyState,
  getApplicantMissingDetails,
} from './admission-applicant-360-model';

const applicant360: AdmissionApplicant360 = {
  applicant: {
    id: 'applicant-1',
    familyId: 'family-1',
    firstName: 'Raj',
    lastName: 'Patel',
    dateOfBirth: null,
    gender: null,
  },
  family: { id: 'family-1', familyNumber: 'FAM/2026/001' },
  primaryGuardian: { firstName: 'Sanjay', mobile: '8893303939' },
  applications: [],
  activities: [],
  notes: [],
};

describe('Applicant 360 presentation model', () => {
  it('explains the pre-application state and incomplete identity', () => {
    expect(getApplicantName(applicant360)).toBe('Raj Patel');
    expect(getApplicantMissingDetails(applicant360)).toEqual(['date of birth', 'gender']);
    expect(getApplicantJourneyState(applicant360.applications)).toMatchObject({
      label: 'Inquiry converted',
      description: 'Ready to start an application',
    });
  });

  it('identifies the current workflow stage and application state', () => {
    const application: AdmissionApplicant360['applications'][number] = {
      id: 'application-1',
      applicationNumber: 'APP/2026/001',
      status: 4,
      creationTime: '2026-09-18T08:00:00Z',
      stages: [
        { code: 'FORM', name: 'Application form', stageType: 0, status: 2, displayOrder: 1 },
        { code: 'REVIEW', name: 'Review', stageType: 1, status: 1, displayOrder: 2 },
      ],
    };

    expect(getCurrentStage(application)).toMatchObject({ code: 'REVIEW', name: 'Review' });
    expect(getApplicantJourneyState([application])).toMatchObject({
      label: 'In review',
      description: 'Review',
    });
  });

  it('prefers the active application instead of a terminal historical application', () => {
    const historical: AdmissionApplicant360['applications'][number] = {
      id: 'application-old',
      applicationNumber: 'APP/2025/001',
      status: 10,
      creationTime: '2025-09-18T08:00:00Z',
      stages: [],
    };
    const active: AdmissionApplicant360['applications'][number] = {
      id: 'application-active',
      applicationNumber: 'APP/2026/001',
      status: 4,
      creationTime: '2026-09-18T08:00:00Z',
      stages: [],
    };

    expect(getPrimaryApplication([historical, active])).toBe(active);
  });

  it('converts internal activity codes into school-facing language', () => {
    expect(
      getActivityPresentation({
        id: 'activity-1',
        activityType: 'InquiryContacted',
        description: 'Inquiry marked as contacted',
        occurredAt: '2026-09-18T08:00:00Z',
      })
    ).toMatchObject({ title: 'Family contact recorded', color: 'success' });

    expect(
      getActivityPresentation({
        id: 'activity-2',
        activityType: 'CustomSchoolEvent',
        description: 'Custom event',
        occurredAt: '2026-09-18T08:00:00Z',
      }).title
    ).toBe('Custom School Event');
  });
});
