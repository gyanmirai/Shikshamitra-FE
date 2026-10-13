import type {
  AdmissionApplication,
  AdmissionApplicationCounsellor,
} from 'src/redux/student/admissions/admission-applications-api';

import { PIPELINE_ACTIVE_STATUSES } from './admission-pipeline-state';

export type BulkPipelineAssignmentFailure = { id: string; name: string; message: string };
export type BulkPipelineAssignmentOutcome = {
  total: number;
  assigned: number;
  unchanged: number;
  failed: number;
};

/** Ownership changes belong to active admission applications, before Student handover. */
export function isPipelineApplicationAssignable(application: AdmissionApplication) {
  return (
    PIPELINE_ACTIVE_STATUSES.includes(application.status) &&
    !application.hasReachedDecision &&
    !application.decisionEnteredAt &&
    !application.studentId &&
    !application.enrolledStudentId &&
    !application.studentEnrollmentId &&
    !application.onboardingCaseId &&
    !application.finalizedAt
  );
}

export function intersectPipelineCounsellors(lists: AdmissionApplicationCounsellor[][]) {
  if (!lists.length) return [];
  const common = lists.slice(1).map((items) => new Set(items.map((item) => item.id)));
  return [...new Map(lists[0].map((item) => [item.id, item])).values()]
    .filter((item) => common.every((ids) => ids.has(item.id)))
    .sort((left, right) =>
      (left.name || left.userName).localeCompare(right.name || right.userName)
    );
}

export function describePipelineAssignmentOutcome(outcome: BulkPipelineAssignmentOutcome) {
  const parts = [`${outcome.assigned} assigned`];
  if (outcome.unchanged) parts.push(`${outcome.unchanged} already assigned`);
  if (outcome.failed) parts.push(`${outcome.failed} could not be assigned`);
  return `${parts.join(', ')} of ${outcome.total} selected admissions.`;
}
