import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionReviewPrerequisite } from 'src/redux/student/admissions/admission-review-policy';

import { readAdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import { readAdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';

export function getReviewPrerequisiteKind(
  stage: AdmissionWorkflowStage
): AdmissionReviewPrerequisite['kind'] | null {
  if (stage.stageType === 2 && readAdmissionAssessmentPolicy(stage.configurationJson)?.enabled)
    return 'assessment';
  if (stage.stageType === 5 && readAdmissionDocumentPolicy(stage.configurationJson)?.enabled)
    return 'documents';
  if (stage.stageType === 3 && readAdmissionEligibilityPolicy(stage.configurationJson)?.enabled)
    return 'eligibility';
  return null;
}

export function getReviewStageError(
  stage: AdmissionWorkflowStage,
  stages: AdmissionWorkflowStage[]
) {
  const policy = readAdmissionReviewPolicy(stage.configurationJson);
  if (!policy?.enabled) return undefined;
  if (
    stages.some(
      (item) =>
        item.id !== stage.id &&
        item.stageType === 6 &&
        readAdmissionReviewPolicy(item.configurationJson)?.enabled
    )
  )
    return 'Use one managed Review stage per workflow. Edit the existing Review stage.';
  const invalid = policy.prerequisites.find(
    (item) =>
      !stages.some(
        (source) =>
          source.id !== stage.id &&
          source.displayOrder < stage.displayOrder &&
          source.code === item.sourceStageCode &&
          getReviewPrerequisiteKind(source) === item.kind
      )
  );
  return invalid ? `Choose an earlier configured stage for ${invalid.sourceStageCode}.` : undefined;
}
