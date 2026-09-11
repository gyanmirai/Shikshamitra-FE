import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { readAdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';

export function getInquiryStageError(
  stage: AdmissionWorkflowStage,
  stages: AdmissionWorkflowStage[]
): string | undefined {
  if (!readAdmissionInquiryPolicy(stage.configurationJson)?.enabled) return undefined;
  if (!stage.isEntryStage) return 'Managed Inquiry must be the workflow entry stage.';
  if (stage.allowManualSkip) return 'Managed Inquiry cannot allow manual skip.';
  const managed = stages.filter(
    (item) =>
      item.id !== stage.id && readAdmissionInquiryPolicy(item.configurationJson)?.enabled === true
  );
  return managed.length ? 'A workflow can contain only one managed Inquiry stage.' : undefined;
}
