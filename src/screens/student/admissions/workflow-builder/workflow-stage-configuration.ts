import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import {
  DEFAULT_DOCUMENT_POLICY,
  readAdmissionDocumentPolicy,
} from 'src/redux/student/admissions/admission-document-policy';
import {
  DEFAULT_FORM_STAGE_POLICY,
  readAdmissionFormStagePolicy,
} from 'src/redux/student/admissions/admission-form-stage-policy';
import {
  readStageConfiguration,
  DEFAULT_ASSESSMENT_POLICY,
  readAdmissionAssessmentPolicy,
} from 'src/redux/student/admissions/admission-assessment-policy';

export const APPLICATION_STAGE_TYPES = [1, 2, 4, 5, 7] as const;
export const isApplicationStageType = (type: number) =>
  APPLICATION_STAGE_TYPES.some((value) => value === type);

// Apply the simplified setup consistently at creation, editing and workflow save boundaries.
// Unsupported saved configurations remain intact so validation can expose the problem.
export function normalizeStageConfiguration(stage: AdmissionWorkflowStage): AdmissionWorkflowStage {
  const configuration = readStageConfiguration(stage.configurationJson);
  if (!configuration) return stage;
  const next = { ...configuration };
  if (stage.stageType === 1) {
    const policy = readAdmissionFormStagePolicy(stage.configurationJson);
    if (configuration.form !== undefined && !policy) return stage;
    next.form = {
      ...(policy ?? DEFAULT_FORM_STAGE_POLICY),
      enabled: true,
      allowSaveAndResume: true,
      autoAdvanceOnSubmit: true,
      requireSectionVerification: false,
      verificationSectionCodes: [],
    };
  } else if (stage.stageType === 2) {
    const policy = readAdmissionAssessmentPolicy(stage.configurationJson);
    if (configuration.assessment !== undefined && !policy) return stage;
    next.assessment = {
      ...(policy ?? DEFAULT_ASSESSMENT_POLICY),
      enabled: true,
      reviewRequired: false,
    };
  } else if (stage.stageType === 5) {
    const policy = readAdmissionDocumentPolicy(stage.configurationJson);
    if (configuration.documentVerification !== undefined && !policy) return stage;
    next.documentVerification = {
      ...(policy ?? DEFAULT_DOCUMENT_POLICY),
      enabled: true,
      allowWaivers: false,
      requireIndependentReview: false,
      collectionFormStageCode: null,
      requirements: (policy ?? DEFAULT_DOCUMENT_POLICY).requirements.map((requirement) => ({
        ...requirement,
        collectionMode: 'upload',
      })),
    };
  } else if (stage.stageType === 4) {
    delete next.payment;
    delete next.paymentCompletion;
  } else return stage;
  const configurationJson = Object.keys(next).length ? JSON.stringify(next) : undefined;
  return configurationJson === stage.configurationJson && !stage.allowManualSkip
    ? stage
    : { ...stage, configurationJson, allowManualSkip: false };
}
