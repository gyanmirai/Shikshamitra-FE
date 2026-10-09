import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import {
  useBookAssessmentAttemptMutation,
  useAllowAssessmentRetakeMutation,
  useRecordAssessmentResultMutation,
  useCancelAssessmentAttemptMutation,
  useRecordAssessmentAttendanceMutation,
  useWaiveApplicationAssessmentMutation,
} from 'src/redux/student/admissions/admission-assessments-api';

import { latestAssessmentAttempt } from './assessment-action-model';

import type { AssessmentAction, AssessmentActionValues } from './assessment-action-model';

export function useAssessmentActions(assessment: ManagedApplicationAssessment) {
  const [book] = useBookAssessmentAttemptMutation();
  const [attendance] = useRecordAssessmentAttendanceMutation();
  const [result] = useRecordAssessmentResultMutation();
  const [retake] = useAllowAssessmentRetakeMutation();
  const [cancel] = useCancelAssessmentAttemptMutation();
  const [waive] = useWaiveApplicationAssessmentMutation();
  return async (action: AssessmentAction, values: AssessmentActionValues) => {
    const stage = {
      applicationId: assessment.applicationId,
      stageInstanceId: assessment.stageInstanceId,
      concurrencyStamp: assessment.concurrencyStamp,
    };
    const notes = values.notes.trim() || undefined;
    if (action === 'book')
      return book({ ...stage, sessionId: values.sessionId || undefined }).unwrap();
    if (action === 'waive') return waive({ ...stage, reason: notes ?? '' }).unwrap();
    const latest = latestAssessmentAttempt(assessment);
    if (!latest) throw new Error('The assessment attempt has changed. Refresh and try again.');
    const attempt = { attemptId: latest.id, concurrencyStamp: latest.concurrencyStamp, notes };
    switch (action) {
      case 'attendance':
        return attendance({ ...attempt, attendance: values.attendance }).unwrap();
      case 'result':
        return result({
          ...attempt,
          ...(assessment.policy.scoringEnabled
            ? { marks: Number(values.marks) }
            : { outcome: values.outcome || undefined }),
        }).unwrap();
      case 'retake':
        return retake(attempt).unwrap();
      case 'cancel':
        return cancel(attempt).unwrap();
      default:
        throw new Error('Unsupported assessment action');
    }
  };
}
