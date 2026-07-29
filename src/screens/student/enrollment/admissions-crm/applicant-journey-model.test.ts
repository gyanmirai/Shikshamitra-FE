import type {
  AdmissionCrmApplicantStepDto,
  AdmissionCrmApplicantProgressDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { it, expect, describe } from 'vitest';
import {
  AdmissionCrmApplicantStepKey,
  AdmissionCrmPipelineColumnKey,
  AdmissionCrmApplicantStepStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  buildApplicantJourney,
  getApplicantNextJourneyStep,
  type ApplicantJourneyStepId,
  type ApplicantJourneyStepState,
} from './applicant-journey-model';

const stepTitles: Record<AdmissionCrmApplicantStepKey, string> = {
  [AdmissionCrmApplicantStepKey.Inquiry]: 'Inquiry',
  [AdmissionCrmApplicantStepKey.Exam]: 'Entrance Exam',
  [AdmissionCrmApplicantStepKey.Registration]: 'Registration',
  [AdmissionCrmApplicantStepKey.Finance]: 'Finance',
  [AdmissionCrmApplicantStepKey.Placement]: 'Class Placement',
  [AdmissionCrmApplicantStepKey.Activation]: 'Activation',
};

const makeStep = (
  step: AdmissionCrmApplicantStepKey,
  status: AdmissionCrmApplicantStepStatus,
  reason = `${stepTitles[step]} status`
): AdmissionCrmApplicantStepDto => ({
  step,
  title: stepTitles[step],
  status,
  isRequired: status !== AdmissionCrmApplicantStepStatus.Skipped,
  reasonCode: `${AdmissionCrmApplicantStepStatus[status]}Reason`,
  reason,
});

const makeProgress = (
  statuses: AdmissionCrmApplicantStepStatus[] = [
    AdmissionCrmApplicantStepStatus.Complete,
    AdmissionCrmApplicantStepStatus.InProgress,
    AdmissionCrmApplicantStepStatus.Blocked,
    AdmissionCrmApplicantStepStatus.Skipped,
    AdmissionCrmApplicantStepStatus.Blocked,
    AdmissionCrmApplicantStepStatus.Blocked,
  ]
): AdmissionCrmApplicantProgressDto => ({
  leadId: 'lead-1',
  academicYearId: 'year-1',
  admissionYearSetupVersion: 1,
  pipelineColumn: AdmissionCrmPipelineColumnKey.ExamPending,
  currentStep: AdmissionCrmApplicantStepKey.Exam,
  nextAction: 'Record the exam result.',
  steps: statuses.map((status, index) => makeStep(index as AdmissionCrmApplicantStepKey, status)),
});

const buildJourney = (
  progress = makeProgress(),
  permissions = { canViewPlacement: true, canViewActivation: true }
) => buildApplicantJourney(progress, permissions);

const getStates = (steps: ReturnType<typeof buildApplicantJourney>) =>
  Object.fromEntries(steps.map((step) => [step.id, step.state])) as Record<
    ApplicantJourneyStepId,
    ApplicantJourneyStepState
  >;

describe('Applicant journey model', () => {
  it('maps the backend projection in the fixed six-step order', () => {
    const steps = buildJourney();

    expect(steps.map((step) => step.id)).toEqual([
      'inquiry',
      'exam',
      'registration',
      'finance',
      'placement',
      'activation',
    ]);
    expect(getStates(steps)).toEqual({
      inquiry: 'complete',
      exam: 'in-progress',
      registration: 'blocked',
      finance: 'skipped',
      placement: 'blocked',
      activation: 'blocked',
    });
  });

  it('prioritizes review, active work, and then not-started work', () => {
    const review = buildJourney(
      makeProgress([
        AdmissionCrmApplicantStepStatus.Complete,
        AdmissionCrmApplicantStepStatus.Complete,
        AdmissionCrmApplicantStepStatus.NeedsReview,
        AdmissionCrmApplicantStepStatus.NotStarted,
        AdmissionCrmApplicantStepStatus.Blocked,
        AdmissionCrmApplicantStepStatus.Blocked,
      ])
    );

    expect(getApplicantNextJourneyStep(review)?.id).toBe('registration');
    expect(getApplicantNextJourneyStep(buildJourney())?.id).toBe('exam');
  });

  it('preserves backend reasons and action codes', () => {
    const progress = makeProgress();
    progress.steps[1] = {
      ...progress.steps[1],
      reasonCode: 'ExamPending',
      reason: 'Record attendance and the entrance exam result.',
      actionCode: 'RecordExamResult',
    };

    expect(buildJourney(progress)[1]).toMatchObject({
      state: 'in-progress',
      reasonCode: 'ExamPending',
      reason: 'Record attendance and the entrance exam result.',
      actionCode: 'RecordExamResult',
    });
  });

  it('applies frontend visibility permissions without changing server progress', () => {
    const restricted = buildJourney(makeProgress(), {
      canViewPlacement: false,
      canViewActivation: false,
    });

    expect(restricted.find((step) => step.id === 'placement')).toMatchObject({
      state: 'blocked',
      reason: 'You do not have permission to review class placement.',
    });
    expect(restricted.find((step) => step.id === 'activation')).toMatchObject({
      state: 'blocked',
      reason: 'You do not have permission to review activation.',
    });
  });

  it('returns no steps until the projection is available', () => {
    expect(
      buildApplicantJourney(undefined, {
        canViewPlacement: true,
        canViewActivation: true,
      })
    ).toEqual([]);
  });
});
