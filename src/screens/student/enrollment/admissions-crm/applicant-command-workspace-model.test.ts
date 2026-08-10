import { it, expect, describe } from 'vitest';
import { AdmissionCrmApplicantStepKey } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  canOpenJourneyStep,
  getJourneyStateLabel,
  getApplicantPrimaryAction,
  resolveApplicantCommandTab,
  isApplicantJourneyActionable,
  isApplicantPrimaryActionPermitted,
} from './applicant-command-workspace-model';

import type { ApplicantJourneyStep } from './applicant-journey-model';

const step = (state: ApplicantJourneyStep['state'], actionCode?: string): ApplicantJourneyStep => ({
  stepKey: AdmissionCrmApplicantStepKey.Exam,
  id: 'exam',
  label: 'Entrance Exam',
  workspaceTab: 'exam',
  state,
  actionCode,
});

describe('Applicant command workspace model', () => {
  it.each([
    ['ScheduleExam', 'Schedule Assessment', 'schedule-exam', 'exam'],
    ['RecordExamResult', 'Record Exam Result', 'open-exams', 'exam'],
    ['ReviewEligibility', 'Review Eligibility', 'open-exams', 'exam'],
    ['ReviewExamAbsence', 'Review Exam Absence', 'open-exams', 'exam'],
    ['StartRegistration', 'Issue Registration Form', 'open-stage', 'registration'],
    ['ContinueRegistration', 'Continue Registration', 'open-stage', 'registration'],
    ['VerifyRegistration', 'Verify Registration', 'open-stage', 'registration'],
    ['ReissueRegistration', 'Reissue Registration', 'open-stage', 'registration'],
    [
      'ReviewRegistrationCorrection',
      'Review Registration Correction',
      'open-stage',
      'registration',
    ],
    ['RequestFinanceVerification', 'Request Finance Review', 'open-stage', 'finance'],
    ['ViewFinanceReference', 'View Finance Status', 'open-stage', 'finance'],
    ['ReviewFinanceIssue', 'Review Finance Issue', 'open-stage', 'finance'],
    ['ReviewPlacement', 'Review Class Placement', 'open-stage', 'offer'],
    ['RequestActivation', 'Request Activation', 'open-stage', 'activation'],
    ['ReviewActivation', 'Review Activation', 'open-stage', 'activation'],
    ['ContinueActivation', 'Continue Activation', 'open-stage', 'activation'],
    ['RepairActivation', 'Repair Activation', 'open-stage', 'activation'],
  ])('maps %s to a specific action', (code, label, kind, tab) => {
    expect(getApplicantPrimaryAction(code)).toMatchObject({ label, kind, tab });
  });

  it('does not invent an action for an unknown or absent code', () => {
    expect(getApplicantPrimaryAction()).toBeUndefined();
    expect(getApplicantPrimaryAction('UnknownAction')).toBeUndefined();
  });

  it('suppresses permission-gated actions without changing the projected action', () => {
    const action = getApplicantPrimaryAction('ScheduleExam');
    expect(isApplicantPrimaryActionPermitted(action, [])).toBe(false);
    expect(
      isApplicantPrimaryActionPermitted(action, [
        {
          name: 'Students.Enrollment.AdmissionsCrm.ScheduleExam',
          isGranted: true,
        },
      ])
    ).toBe(true);
    expect(action?.label).toBe('Schedule Assessment');
  });

  it('resolves next to the backend current step while keeping explicit history', () => {
    expect(resolveApplicantCommandTab('next', step('in-progress'))).toBe('exam');
    expect(resolveApplicantCommandTab('registration', step('in-progress'))).toBe('registration');
  });

  it.each([
    ['complete', true, 'Complete'],
    ['in-progress', true, 'In progress'],
    ['needs-review', true, 'Needs review'],
    ['skipped', false, 'Not required'],
    ['blocked', false, 'Blocked'],
    ['not-started', false, 'Not started'],
  ] as const)('presents %s without conflating status', (state, canOpen, label) => {
    const journeyStep = step(state);
    expect(canOpenJourneyStep(journeyStep)).toBe(canOpen);
    expect(getJourneyStateLabel(journeyStep)).toBe(label);
  });

  it.each([
    ['not-started', 'ScheduleExam'],
    ['in-progress', 'RecordExamResult'],
    ['needs-review', 'ReviewEligibility'],
    ['blocked', 'RepairActivation'],
  ] as const)('keeps authoritative %s actions available', (state, actionCode) => {
    const journeyStep = step(state, actionCode);
    expect(isApplicantJourneyActionable(journeyStep)).toBe(true);
    expect(canOpenJourneyStep(journeyStep)).toBe(true);
  });

  it.each([
    ['complete', 'RepairActivation'],
    ['skipped', 'ScheduleExam'],
    ['blocked', undefined],
    ['not-started', 'UnknownAction'],
  ] as const)('does not fabricate work for %s with %s', (state, actionCode) => {
    const journeyStep = step(state, actionCode);
    expect(isApplicantJourneyActionable(journeyStep)).toBe(false);
    if (state === 'blocked' || state === 'not-started') {
      expect(canOpenJourneyStep(journeyStep)).toBe(false);
    }
  });

  it('uses the permissions required by the operation that opens', () => {
    expect(getApplicantPrimaryAction('ContinueRegistration')?.requiredPermission).toBe(
      'Students.Enrollment.AdmissionsCrm.IssueRegistrationForm'
    );
    expect(getApplicantPrimaryAction('ReviewRegistrationCorrection')?.requiredPermission).toBe(
      'Students.Enrollment.AdmissionsCrm.IssueRegistrationForm'
    );
    expect(getApplicantPrimaryAction('RequestFinanceVerification')?.requiredPermission).toBe(
      'Students.Enrollment.AdmissionsCrm.IssueQuotations'
    );
  });
});
