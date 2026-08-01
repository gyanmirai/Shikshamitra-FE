import { it, expect, describe } from 'vitest';
import {
  AdmissionInquiryStage,
  AdmissionCrmRouteType,
  AdmissionInquiryChannel,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
  AdmissionCrmPipelineColumnKey,
  AdmissionCrmRegistrationStatus,
  AdmissionCrmOperationsQueueType,
  AdmissionCrmServiceHandoffStatus,
  AdmissionCrmApplicantDocumentStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  getWorkspaceFromPathname,
  areSearchParamsEquivalent,
  getPersonaWorkspaceDefaults,
  parseEnrollmentWorkspaceState,
  migrateLegacyWorkspaceFilters,
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

  it('round trips an applicant return location and Activity tab', () => {
    const returnTo = '/student/enrollment/pipeline?cycle=cycle-1&view=list&page=3';
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams({
        applicant: 'lead-1',
        return: returnTo,
        tab: 'activity',
      })
    );

    expect(state).toMatchObject({
      applicant: 'lead-1',
      returnTo,
      applicantTab: 'activity',
    });

    const serialized = serializeEnrollmentWorkspaceState(state);
    expect(serialized.get('applicant')).toBe('lead-1');
    expect(serialized.get('return')).toBe(returnTo);
    expect(serialized.get('tab')).toBe('activity');
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

  it('round trips the selected report view independently of the Pipeline view', () => {
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams({ report: 'standards', view: 'list' })
    );

    expect(state.reportView).toBe('standards');
    expect(state.view).toBe('list');

    const serialized = serializeEnrollmentWorkspaceState(state);
    expect(serialized.get('report')).toBe('standards');
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

  it('treats Admission Year workspace tab routes as settings paths without query-owned tab state', () => {
    expect(
      getWorkspaceFromPathname('/student/enrollment/settings/admission-cycles/cycle-1/setup')
    ).toBe('settings');
    expect(
      getWorkspaceFromPathname(
        '/student/enrollment/settings/admission-cycles/cycle-1/journey-rules'
      )
    ).toBe('settings');
    expect(
      getWorkspaceFromPathname('/student/enrollment/settings/admission-cycles/cycle-1/activity')
    ).toBe('settings');

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

  it('migrates non-sensitive legacy filters and excludes free-text search', () => {
    const migrated = migrateLegacyWorkspaceFilters(
      JSON.stringify({
        searchText: 'parent phone number',
        stageFilter: AdmissionInquiryStage.FollowUp,
        channelFilter: AdmissionInquiryChannel.WalkInReception,
        operationsQueueType: AdmissionCrmOperationsQueueType.RejectedDocument,
        operationsUrgentOnly: true,
      })
    );
    expect(migrated).toEqual({
      pipelineColumn: AdmissionCrmPipelineColumnKey.FollowUp,
      channel: AdmissionInquiryChannel.WalkInReception,
      queue: AdmissionCrmOperationsQueueType.RejectedDocument,
      urgent: true,
    });
    expect(migrated).not.toHaveProperty('searchText');
  });

  it('provides role-focused defaults without changing persisted business state', () => {
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
      queue: AdmissionCrmOperationsQueueType.RegistrationInvitationPending,
    });
    expect(getPersonaWorkspaceDefaults('operations', 'administrator')).toEqual({
      queue: AdmissionCrmOperationsQueueType.HouseholdResolution,
    });
  });
});
