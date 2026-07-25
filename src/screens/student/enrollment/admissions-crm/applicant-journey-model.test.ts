import { it, expect, describe } from 'vitest';
import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  type AdmissionCrmLeadDto,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
  AdmissionCrmRegistrationStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  buildApplicantJourney,
  type ApplicantJourneyFacts,
  getApplicantNextJourneyStep,
  type ApplicantJourneyStepId,
  type ApplicantJourneyStepState,
} from './applicant-journey-model';

const makeLead = (
  stage: AdmissionInquiryStage,
  overrides: Partial<AdmissionCrmLeadDto> = {}
): AdmissionCrmLeadDto => ({
  id: 'lead-1',
  academicYearId: 'year-1',
  channel: AdmissionInquiryChannel.QuickCallEntry,
  firstName: 'Aarav',
  lastName: 'Shah',
  admissionIntent: 'Admission inquiry',
  stage,
  leadScore: 0,
  priority: AdmissionCrmLeadPriority.None,
  lastActivityTime: '2026-07-23T00:00:00Z',
  likelyDuplicateCount: 0,
  likelyDuplicates: [],
  ...overrides,
});

const buildJourney = (overrides: Partial<ApplicantJourneyFacts> = {}) =>
  buildApplicantJourney({
    lead: makeLead(AdmissionInquiryStage.NewInquiry),
    allowRegistrationBeforeExam: false,
    entranceExamRequired: true,
    hasExam: false,
    canViewOffers: true,
    canViewActivation: true,
    ...overrides,
  });

const getStates = (steps: ReturnType<typeof buildApplicantJourney>) =>
  Object.fromEntries(steps.map((step) => [step.id, step.state])) as Record<
    ApplicantJourneyStepId,
    ApplicantJourneyStepState
  >;

const terminalStageCases = [
  ['Rejected', AdmissionInquiryStage.Rejected, 'skipped'],
  ['Stale', AdmissionInquiryStage.Stale, 'locked'],
  ['Archived', AdmissionInquiryStage.Archived, 'locked'],
] as const;

describe('Applicant journey model', () => {
  it('keeps downstream work locked while a new inquiry still needs qualification', () => {
    const steps = buildJourney();

    expect(getStates(steps)).toEqual({
      inquiry: 'current',
      exam: 'locked',
      registration: 'locked',
      offer: 'locked',
      activation: 'locked',
    });
    expect(getApplicantNextJourneyStep(steps)?.id).toBe('inquiry');
  });

  it('selects an existing entrance assessment before later available work', () => {
    const steps = buildJourney({
      lead: makeLead(AdmissionInquiryStage.ExamReady),
      allowRegistrationBeforeExam: true,
      hasExam: true,
    });

    expect(getStates(steps)).toMatchObject({
      inquiry: 'complete',
      exam: 'current',
      registration: 'available',
    });
    expect(getApplicantNextJourneyStep(steps)?.id).toBe('exam');
  });

  it('makes registration the next step when policy permits it before an exam', () => {
    const steps = buildJourney({ allowRegistrationBeforeExam: true });

    expect(getStates(steps)).toMatchObject({
      inquiry: 'current',
      exam: 'locked',
      registration: 'available',
    });
    expect(getApplicantNextJourneyStep(steps)?.id).toBe('registration');
  });

  it('skips entrance and opens registration when the cycle does not require an exam', () => {
    const steps = buildJourney({ entranceExamRequired: false });

    expect(getStates(steps)).toMatchObject({
      inquiry: 'current',
      exam: 'skipped',
      registration: 'available',
    });
    expect(getApplicantNextJourneyStep(steps)?.id).toBe('registration');
  });

  it('gates offers on verified registration and activation on an accepted offer', () => {
    const eligibleLead = makeLead(AdmissionInquiryStage.Eligible);
    const registrationVerified = buildJourney({
      lead: eligibleLead,
      hasExam: true,
      registrationStatus: AdmissionCrmRegistrationStatus.Verified,
    });

    expect(getStates(registrationVerified)).toMatchObject({
      inquiry: 'complete',
      exam: 'complete',
      registration: 'complete',
      offer: 'available',
      activation: 'locked',
    });
    expect(getApplicantNextJourneyStep(registrationVerified)?.id).toBe('offer');

    const offerAccepted = buildJourney({
      lead: eligibleLead,
      hasExam: true,
      registrationStatus: AdmissionCrmRegistrationStatus.Verified,
      offerStatus: AdmissionCrmSeatOfferStatus.Accepted,
    });

    expect(getStates(offerAccepted)).toMatchObject({
      offer: 'complete',
      activation: 'available',
    });
    expect(getApplicantNextJourneyStep(offerAccepted)?.id).toBe('activation');
  });

  it.each(terminalStageCases)(
    'does not unlock new work for a %s applicant even when early registration is allowed',
    (_, stage, expectedExamState) => {
      const steps = buildJourney({
        lead: makeLead(stage),
        allowRegistrationBeforeExam: true,
      });

      expect(getStates(steps)).toEqual({
        inquiry: 'complete',
        exam: expectedExamState,
        registration: 'locked',
        offer: 'locked',
        activation: 'locked',
      });
      expect(steps.find((step) => step.id === 'registration')?.reason).toContain(
        'terminal pipeline stage'
      );
      expect(getApplicantNextJourneyStep(steps)).toBeUndefined();
    }
  );

  it.each(terminalStageCases)(
    'keeps resolved artifacts viewable without suggesting more work for a %s applicant',
    (_, stage) => {
      const steps = buildJourney({
        lead: makeLead(stage),
        hasExam: true,
        registrationStatus: AdmissionCrmRegistrationStatus.Withdrawn,
        offerStatus: AdmissionCrmSeatOfferStatus.Declined,
        activationStatus: AdmissionCrmActivationStatus.Cancelled,
      });

      expect(getStates(steps)).toEqual({
        inquiry: 'complete',
        exam: 'complete',
        registration: 'complete',
        offer: 'complete',
        activation: 'complete',
      });
      expect(getApplicantNextJourneyStep(steps)).toBeUndefined();
    }
  );

  it.each([
    AdmissionCrmRegistrationStatus.Expired,
    AdmissionCrmRegistrationStatus.Revoked,
    AdmissionCrmRegistrationStatus.Withdrawn,
  ])('treats closed registration status %s as resolved for a terminal applicant', (status) => {
    const steps = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Archived),
      registrationStatus: status,
    });

    expect(steps.find((step) => step.id === 'registration')?.state).toBe('complete');
    expect(getApplicantNextJourneyStep(steps)).toBeUndefined();
  });

  it.each([
    AdmissionCrmSeatOfferStatus.Declined,
    AdmissionCrmSeatOfferStatus.Expired,
    AdmissionCrmSeatOfferStatus.Revoked,
    AdmissionCrmSeatOfferStatus.Superseded,
    AdmissionCrmSeatOfferStatus.Cancelled,
  ])('treats closed offer status %s as resolved for a terminal applicant', (status) => {
    const steps = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Stale),
      offerStatus: status,
    });

    expect(steps.find((step) => step.id === 'offer')?.state).toBe('complete');
    expect(getApplicantNextJourneyStep(steps)).toBeUndefined();
  });

  it('suggests only existing artifacts that genuinely remain in progress', () => {
    const registrationInProgress = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Rejected),
      registrationStatus: AdmissionCrmRegistrationStatus.Issued,
    });
    expect(getStates(registrationInProgress)).toMatchObject({
      registration: 'current',
      offer: 'locked',
      activation: 'locked',
    });
    expect(getApplicantNextJourneyStep(registrationInProgress)?.id).toBe('registration');

    const offerInProgress = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Stale),
      hasExam: true,
      registrationStatus: AdmissionCrmRegistrationStatus.Verified,
      offerStatus: AdmissionCrmSeatOfferStatus.Issued,
    });
    expect(getStates(offerInProgress)).toMatchObject({
      registration: 'complete',
      offer: 'current',
      activation: 'locked',
    });
    expect(getApplicantNextJourneyStep(offerInProgress)?.id).toBe('offer');

    const activationInProgress = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Archived),
      hasExam: true,
      registrationStatus: AdmissionCrmRegistrationStatus.AdmissionReady,
      offerStatus: AdmissionCrmSeatOfferStatus.Accepted,
      activationStatus: AdmissionCrmActivationStatus.RepairRequired,
    });
    expect(getStates(activationInProgress)).toMatchObject({
      registration: 'complete',
      offer: 'complete',
      activation: 'current',
    });
    expect(getApplicantNextJourneyStep(activationInProgress)?.id).toBe('activation');
  });

  it.each(terminalStageCases)(
    'does not create a new activation action from an accepted offer for a %s applicant',
    (_, stage) => {
      const steps = buildJourney({
        lead: makeLead(stage),
        hasExam: true,
        registrationStatus: AdmissionCrmRegistrationStatus.Verified,
        offerStatus: AdmissionCrmSeatOfferStatus.Accepted,
      });

      expect(getStates(steps)).toMatchObject({
        registration: 'complete',
        offer: 'complete',
        activation: 'locked',
      });
      expect(getApplicantNextJourneyStep(steps)).toBeUndefined();
    }
  );

  it.each(terminalStageCases)(
    'does not create a new offer action from verified registration for a %s applicant',
    (_, stage) => {
      const steps = buildJourney({
        lead: makeLead(stage),
        hasExam: true,
        registrationStatus: AdmissionCrmRegistrationStatus.Verified,
      });

      expect(getStates(steps)).toMatchObject({
        registration: 'complete',
        offer: 'locked',
        activation: 'locked',
      });
      expect(getApplicantNextJourneyStep(steps)).toBeUndefined();
    }
  );

  it('keeps a legacy issued registration artifact current in a terminal stage', () => {
    const steps = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Stale, {
        registrationFormNumber: 'REG-2026-001',
      }),
    });

    expect(steps.find((step) => step.id === 'registration')?.state).toBe('current');
    expect(getApplicantNextJourneyStep(steps)?.id).toBe('registration');
  });

  it('keeps an existing optional entrance artifact viewable without suggesting it as new work', () => {
    const steps = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Archived),
      entranceExamRequired: false,
      hasExam: true,
    });

    expect(steps.find((step) => step.id === 'exam')?.state).toBe('complete');
    expect(getApplicantNextJourneyStep(steps)).toBeUndefined();
  });

  it('does not expose permission-protected terminal artifacts as current work', () => {
    const steps = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Archived),
      hasExam: true,
      registrationStatus: AdmissionCrmRegistrationStatus.Verified,
      offerStatus: AdmissionCrmSeatOfferStatus.Issued,
      activationStatus: AdmissionCrmActivationStatus.RepairRequired,
      canViewOffers: false,
      canViewActivation: false,
    });

    expect(steps.find((step) => step.id === 'offer')).toMatchObject({
      state: 'locked',
      reason: 'You do not have permission to view seat offers.',
    });
    expect(steps.find((step) => step.id === 'activation')).toMatchObject({
      state: 'locked',
      reason: 'You do not have permission to view activation.',
    });
    expect(getApplicantNextJourneyStep(steps)).toBeUndefined();
  });

  it('locks permission-protected steps and returns no next step after activation completes', () => {
    const permissionRestricted = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Eligible),
      hasExam: true,
      registrationStatus: AdmissionCrmRegistrationStatus.Verified,
      canViewOffers: false,
      canViewActivation: false,
    });

    expect(permissionRestricted.find((step) => step.id === 'offer')).toMatchObject({
      state: 'locked',
      reason: 'You do not have permission to view seat offers.',
    });
    expect(permissionRestricted.find((step) => step.id === 'activation')).toMatchObject({
      state: 'locked',
      reason: 'You do not have permission to view activation.',
    });

    const completed = buildJourney({
      lead: makeLead(AdmissionInquiryStage.Eligible),
      hasExam: true,
      registrationStatus: AdmissionCrmRegistrationStatus.AdmissionReady,
      offerStatus: AdmissionCrmSeatOfferStatus.Accepted,
      activationStatus: AdmissionCrmActivationStatus.FirstDayReady,
    });

    expect(getStates(completed)).toEqual({
      inquiry: 'complete',
      exam: 'complete',
      registration: 'complete',
      offer: 'complete',
      activation: 'complete',
    });
    expect(getApplicantNextJourneyStep(completed)).toBeUndefined();
  });
});
