import { it, expect, describe } from 'vitest';
import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmOperationsQueueType,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  getPersonaWorkspaceDefaults,
  parseEnrollmentWorkspaceState,
  migrateLegacyWorkspaceFilters,
  serializeEnrollmentWorkspaceState,
} from './enrollment-workspace-state';

describe('Enrollment workspace URL state', () => {
  it('round trips non-sensitive workspace state', () => {
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams(
        'cycle=cycle-1&view=list&page=3&stage=2&channel=1&owner=staff-1&urgent=1&applicant=lead-1'
      )
    );

    expect(state).toMatchObject({
      cycle: 'cycle-1',
      view: 'list',
      page: 3,
      stage: AdmissionInquiryStage.ExamReady,
      channel: AdmissionInquiryChannel.QuickCallEntry,
      owner: 'staff-1',
      urgent: true,
      applicant: 'lead-1',
    });
    expect(serializeEnrollmentWorkspaceState(state).get('page')).toBe('3');
  });

  it('rejects invalid enum, date, and pagination values', () => {
    const state = parseEnrollmentWorkspaceState(
      new URLSearchParams('stage=999&queue=999&page=-2&from=12-07-2026')
    );
    expect(state.stage).toBeUndefined();
    expect(state.queue).toBeUndefined();
    expect(state.page).toBe(1);
    expect(state.from).toBeUndefined();
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
      stage: AdmissionInquiryStage.FollowUp,
      channel: AdmissionInquiryChannel.WalkInReception,
      queue: AdmissionCrmOperationsQueueType.RejectedDocument,
      urgent: true,
    });
    expect(migrated).not.toHaveProperty('searchText');
  });

  it('provides role-focused defaults without changing persisted business state', () => {
    expect(getPersonaWorkspaceDefaults('pipeline', 'receptionist')).toEqual({
      view: 'list',
      stage: AdmissionInquiryStage.NewInquiry,
    });
    expect(getPersonaWorkspaceDefaults('pipeline', 'counselor')).toEqual({
      view: 'board',
      owner: 'me',
    });
    expect(getPersonaWorkspaceDefaults('offers', 'approver')).toEqual({
      queue: AdmissionCrmOperationsQueueType.FinalApproval,
    });
  });
});
