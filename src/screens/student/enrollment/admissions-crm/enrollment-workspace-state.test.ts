import { it, expect, describe } from 'vitest';
import {
  AdmissionInquiryChannel,
  AdmissionCrmPipelineColumnKey,
  AdmissionCrmServiceHandoffStatus,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  AdmissionCrmRouteType,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  AdmissionCrmEventType,
  AdmissionCrmEventStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  AdmissionCrmRegistrationStatus,
  AdmissionCrmApplicantDocumentStatus,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/operations-governance-contracts';

import {
  getWorkspaceFromPathname,
  areSearchParamsEquivalent,
  getPersonaWorkspaceDefaults,
  parseEnrollmentWorkspaceState,
  serializeEnrollmentWorkspaceState,
} from './enrollment-workspace-state';

describe('Enrollment workspace URL state', () => {
  it('treats query ordering as equivalent to avoid redundant route replacement', () => {
    expect(
      areSearchParamsEquivalent(
        new URLSearchParams('cycle=cycle-1&page=2&view=list&stage=0'),
        new URLSearchParams('cycle=cycle-1&view=list&stage=0&page=2')
      )
    ).toBe(true);
    expect(
      areSearchParamsEquivalent(
        new URLSearchParams('cycle=cycle-1&page=2'),
        new URLSearchParams('cycle=cycle-1&page=3')
      )
    ).toBe(false);
  });

  it('round trips non-sensitive workspace state', () => {
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams(
        `cycle=cycle-1&view=list&page=3&column=${AdmissionCrmPipelineColumnKey.ExamPending}&channel=1&owner=staff-1&urgent=1&applicant=lead-1&tab=exam&panel=forms&registrationStatus=${AdmissionCrmRegistrationStatus.Submitted}&documentStatus=${AdmissionCrmApplicantDocumentStatus.Verified}&offerStatus=${AdmissionCrmSeatOfferStatus.Accepted}&routeType=${AdmissionCrmRouteType.RteEws}&seatPool=pool-1&activationStatus=${AdmissionCrmActivationStatus.InProgress}&handoffStatus=${AdmissionCrmServiceHandoffStatus.Acknowledged}`
      )
    );

    expect(state).toMatchObject({
      cycle: 'cycle-1',
      view: 'list',
      page: 3,
      pipelineColumn: AdmissionCrmPipelineColumnKey.ExamPending,
      channel: AdmissionInquiryChannel.QuickCallEntry,
      owner: 'staff-1',
      urgent: true,
      applicant: 'lead-1',
      applicantTab: 'exam',
      settingsPanel: 'forms',
      registrationStatus: AdmissionCrmRegistrationStatus.Submitted,
      documentStatus: AdmissionCrmApplicantDocumentStatus.Verified,
      offerStatus: AdmissionCrmSeatOfferStatus.Accepted,
      routeType: AdmissionCrmRouteType.RteEws,
      seatPoolId: 'pool-1',
      activationStatus: AdmissionCrmActivationStatus.InProgress,
      serviceHandoffStatus: AdmissionCrmServiceHandoffStatus.Acknowledged,
    });
    expect(serializeEnrollmentWorkspaceState(state).get('page')).toBe('3');
    expect(serializeEnrollmentWorkspaceState(state).get('panel')).toBe('forms');
    expect(serializeEnrollmentWorkspaceState(state).get('tab')).toBe('exam');
    expect(serializeEnrollmentWorkspaceState(state).get('column')).toBe(
      String(AdmissionCrmPipelineColumnKey.ExamPending)
    );
    expect(serializeEnrollmentWorkspaceState(state).get('seatPool')).toBe('pool-1');
  });

  it('recognizes Visits & Events and round trips its structural filters', () => {
    expect(getWorkspaceFromPathname('/student/enrollment/visits-events')).toBe('events');
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams({
        eventType: String(AdmissionCrmEventType.OpenHouse),
        eventStatus: String(AdmissionCrmEventStatus.Published),
      })
    );
    expect(state.eventType).toBe(AdmissionCrmEventType.OpenHouse);
    expect(state.eventStatus).toBe(AdmissionCrmEventStatus.Published);
    const serialized = serializeEnrollmentWorkspaceState(state);
    expect(serialized.get('eventType')).toBe(String(AdmissionCrmEventType.OpenHouse));
    expect(serialized.get('eventStatus')).toBe(String(AdmissionCrmEventStatus.Published));
  });

  it('preserves targeted exam handoffs', () => {
    const handoff = parseEnrollmentWorkspaceState(
      new URLSearchParams({
        applicant: 'lead-1',
        examAction: 'review-eligibility',
        applicantReturn: 'return-token',
      })
    );
    expect(handoff).toMatchObject({
      applicant: 'lead-1',
      examAction: 'review-eligibility',
      applicantReturn: 'return-token',
    });
    const serialized = serializeEnrollmentWorkspaceState(handoff);
    expect(serialized.get('examAction')).toBe('review-eligibility');
    expect(serialized.get('applicantReturn')).toBe('return-token');
  });

  it('keeps date-range state separate from the applicant return token', () => {
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams({
        from: '2026-07-01',
        to: '2026-07-31',
        return: 'applicant-return-token',
      })
    );

    expect(state).toMatchObject({
      from: '2026-07-01',
      to: '2026-07-31',
      returnTo: 'applicant-return-token',
    });

    const serialized = serializeEnrollmentWorkspaceState(state);
    expect(serialized.get('from')).toBe('2026-07-01');
    expect(serialized.get('to')).toBe('2026-07-31');
    expect(serialized.get('return')).toBe('applicant-return-token');
  });

  it('round trips the report view and comparison cycle independently of the Pipeline view', () => {
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams({
        report: 'standards',
        compare: 'cycle-previous',
        export: 'export-request-1',
        view: 'list',
      })
    );

    expect(state.reportView).toBe('standards');
    expect(state.compareCycle).toBe('cycle-previous');
    expect(state.exportId).toBe('export-request-1');
    expect(state.view).toBe('list');

    const serialized = serializeEnrollmentWorkspaceState(state);
    expect(serialized.get('report')).toBe('standards');
    expect(serialized.get('compare')).toBe('cycle-previous');
    expect(serialized.get('export')).toBe('export-request-1');
    expect(serialized.get('view')).toBe('list');
  });

  it('rejects an unsupported report view', () => {
    expect(
      parseEnrollmentWorkspaceState(new URLSearchParams({ report: 'private-breakdown' })).reportView
    ).toBeUndefined();
  });

  it.each(['sources', 'types', 'form-numbering', 'activation', 'numbering'])(
    'round trips the %s settings task',
    (panel) => {
      const state = parseEnrollmentWorkspaceState(new URLSearchParams({ panel }));

      expect(state.settingsPanel).toBe(panel);
      expect(serializeEnrollmentWorkspaceState(state).get('panel')).toBe(panel);
    }
  );

  it('rejects impossible report dates from deep links', () => {
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams({ from: '2026-02-31', to: '2026-03-01' })
    );

    expect(state.from).toBeUndefined();
    expect(state.to).toBe('2026-03-01');
  });

  it('recognizes the dynamic applicant route as the applicant workspace', () => {
    expect(getWorkspaceFromPathname('/student/enrollment/applicants/lead-1')).toBe('applicant');
  });

  it('treats the canonical Admission Year route as settings without query-owned tab state', () => {
    expect(getWorkspaceFromPathname('/student/enrollment/settings/admission-year')).toBe(
      'settings'
    );

    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams('cycle=cycle-1&board=board-1&medium=medium-1&tab=setup')
    );

    expect(state).toMatchObject({
      cycle: 'cycle-1',
      board: 'board-1',
      medium: 'medium-1',
    });
    expect(state.applicantTab).toBeUndefined();
    expect(serializeEnrollmentWorkspaceState(state).toString()).toBe(
      'cycle=cycle-1&board=board-1&medium=medium-1'
    );
  });

  it('rejects invalid enum, date, and pagination values', () => {
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams('stage=999&queue=999&page=-2&from=12-07-2026&panel=unknown')
    );
    expect(state.pipelineColumn).toBeUndefined();
    expect(state.queue).toBeUndefined();
    expect(state.page).toBe(1);
    expect(state.from).toBeUndefined();
    expect(state.settingsPanel).toBeUndefined();
  });

  it('provides role-focused defaults without changing persisted business state', () => {
    expect(getPersonaWorkspaceDefaults('applicant', 'counselor')).toEqual({
      applicantTab: 'inquiry',
    });
    expect(getPersonaWorkspaceDefaults('pipeline', 'receptionist')).toEqual({
      view: 'list',
      pipelineColumn: AdmissionCrmPipelineColumnKey.NewInquiry,
    });
    expect(getPersonaWorkspaceDefaults('pipeline', 'counselor')).toEqual({
      view: 'board',
      owner: 'me',
    });
    expect(getPersonaWorkspaceDefaults('pipeline', 'administrator')).toEqual({
      view: 'list',
    });
    expect(getPersonaWorkspaceDefaults('offers', 'approver')).toEqual({
      queue: AdmissionCrmOperationsQueueType.FinalApproval,
    });
    expect(getPersonaWorkspaceDefaults('registrations', 'counselor')).toEqual({
      pipelineColumn: AdmissionCrmPipelineColumnKey.RegistrationPending,
    });
    expect(getPersonaWorkspaceDefaults('operations', 'administrator')).toEqual({
      queue: AdmissionCrmOperationsQueueType.HouseholdResolution,
    });
  });
});
