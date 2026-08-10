import type { AdmissionCrmEntranceExamDto } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import type { AdmissionCrmBulkOperationResultDto } from 'src/redux/student/admissions-crm/operations-governance-contracts';

export type EnrollmentBulkFailure = {
  entityId: string;
  applicantName: string;
  reason: string;
};

export const getExamBulkFailures = (
  result: AdmissionCrmBulkOperationResultDto,
  exams: AdmissionCrmEntranceExamDto[]
): EnrollmentBulkFailure[] => {
  const applicantNames = new Map(exams.map((exam) => [exam.id, exam.applicantName]));

  return result.items
    .filter((item) => !item.success)
    .map((item) => ({
      entityId: item.entityId,
      applicantName: applicantNames.get(item.entityId) || 'Unknown applicant',
      reason:
        item.blockingReasons.filter(Boolean).join('; ') ||
        item.message?.trim() ||
        item.errorCode?.trim() ||
        'The record could not be processed.',
    }));
};
