import type { AssessmentSession } from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { studentPaths } from 'src/constants/student-menu';

import { assessmentScopeKey } from './assessment-utils';
import { normalizeAssessmentDateTime } from './assessment-date-time';

export function getAvailableAssessmentSessions(sessions: AssessmentSession[]) {
  return sessions.filter(
    (session) =>
      !session.isCancelled &&
      session.bookedCount < session.capacity &&
      dayjs(normalizeAssessmentDateTime(session.startsAt)).isAfter(dayjs())
  );
}

export function getAssessmentSchedulingUrl(
  scope: { admissionOfferingId: string; workflowStageDefinitionId: string },
  currentParams: URLSearchParams
) {
  const params = new URLSearchParams({
    assessmentTab: 'sessions',
    assessmentScope: assessmentScopeKey(scope),
  });
  const returnParams = new URLSearchParams(currentParams.get('returnTo')?.split('?')[1] ?? '');
  ['board', 'medium', 'class'].forEach((key) => {
    const value = currentParams.get(key) ?? returnParams.get(key);
    if (value) params.set(key, value);
  });
  return `${studentPaths.enrollment.assessments}?${params.toString()}`;
}
