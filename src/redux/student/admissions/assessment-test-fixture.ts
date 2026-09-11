import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

import { DEFAULT_ASSESSMENT_POLICY } from './admission-assessment-policy';

import type { AssessmentSession, ApplicationAssessment } from './admission-assessment-types';

export const stageKey = { applicationId: 'application-1', stageInstanceId: 'stage-1' };
export const sessionKey = { admissionOfferingId: 'offering-1', workflowStageDefinitionId: 'definition-1' };
export const stagePath = '*/api/student/enrollment/admissions/assessments/applications/application-1/stages/stage-1';
export const assessmentPath = '*/api/student/enrollment/admissions/assessments';

export const assessmentResponse: ApplicationAssessment = {
  ...stageKey, assessmentEnabled: true, policy: DEFAULT_ASSESSMENT_POLICY,
  attempts: [], concurrencyStamp: 'stage-stamp', blockers: ['Record a result'],
  canComplete: false, canBook: true, canRecordAttendance: false,
  canRecordResult: false, canReview: false, canRetake: false, canWaive: false, canCancel: false,
};
export const sessionResponse: AssessmentSession = {
  ...sessionKey, id: 'session-1', name: 'Entrance exam',
  startsAt: '2026-09-20T10:00:00Z', endsAt: '2026-09-20T11:00:00Z', location: 'Hall A',
  capacity: 30, bookedCount: 0, isCancelled: false, concurrencyStamp: 'session-stamp',
};

export const createAssessmentTestStore = () => configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});
