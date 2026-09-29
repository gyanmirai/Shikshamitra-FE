import { readStageConfiguration } from './admission-assessment-policy';

import type { AdmissionForm } from './admission-forms-api';

export type AdmissionFormResponsibility = 'applicant' | 'guardian' | 'staff' | 'shared';
export type AdmissionFormStagePolicy = {
  version: 1;
  enabled: boolean;
  responsibility: AdmissionFormResponsibility;
  allowSaveAndResume: boolean;
  dueInDays: number | null;
  allowLateSubmission: boolean;
  autoAdvanceOnSubmit: boolean;
  allowCorrectionRequests: boolean;
  maxSubmissionAttempts: number;
  requireSectionVerification: boolean;
  verificationSectionCodes: string[];
};

export const DEFAULT_FORM_STAGE_POLICY: AdmissionFormStagePolicy = {
  version: 1,
  enabled: true,
  responsibility: 'applicant',
  allowSaveAndResume: true,
  dueInDays: null,
  allowLateSubmission: true,
  autoAdvanceOnSubmit: true,
  allowCorrectionRequests: true,
  maxSubmissionAttempts: 3,
  requireSectionVerification: false,
  verificationSectionCodes: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

export function readAdmissionFormStagePolicy(json?: string): AdmissionFormStagePolicy | null {
  const value = readStageConfiguration(json)?.form;
  if (!isRecord(value) || value.version !== 1 || typeof value.enabled !== 'boolean') return null;
  const policy = { ...DEFAULT_FORM_STAGE_POLICY, ...value } as AdmissionFormStagePolicy;
  if (
    !['applicant', 'guardian', 'staff', 'shared'].includes(policy.responsibility) ||
    [
      policy.allowSaveAndResume,
      policy.allowLateSubmission,
      policy.autoAdvanceOnSubmit,
      policy.allowCorrectionRequests,
      policy.requireSectionVerification,
    ].some((item) => typeof item !== 'boolean') ||
    (policy.dueInDays != null && typeof policy.dueInDays !== 'number') ||
    typeof policy.maxSubmissionAttempts !== 'number' ||
    !Array.isArray(policy.verificationSectionCodes) ||
    !policy.verificationSectionCodes.every((code) => typeof code === 'string')
  )
    return null;
  return policy;
}

export function writeAdmissionFormStagePolicy(
  json: string | undefined,
  policy: AdmissionFormStagePolicy
) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previous = configuration.form;
  if (previous !== undefined && !readAdmissionFormStagePolicy(json))
    throw new Error('These Form stage settings are unsupported. Reload the workflow.');
  const extra = isRecord(previous) ? previous : {};
  return JSON.stringify({ ...configuration, form: { ...extra, ...policy } });
}

export function writeAdmissionFormDefinitionId(json: string | undefined, formDefinitionId: string) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previousFormId =
    typeof configuration.formDefinitionId === 'string' ? configuration.formDefinitionId : '';
  const policy = readAdmissionFormStagePolicy(json);
  const updated = JSON.stringify({
    ...configuration,
    formDefinitionId: formDefinitionId.trim(),
    ...(policy && previousFormId !== formDefinitionId.trim()
      ? { form: { ...policy, verificationSectionCodes: [] } }
      : {}),
  });
  return ensureAdmissionFormStageConfiguration(updated) ?? updated;
}

export function ensureAdmissionFormStageConfiguration(json?: string): string | undefined {
  const configuration = readStageConfiguration(json);
  if (!configuration || configuration.form !== undefined) return json;
  const formDefinitionId =
    typeof configuration.formDefinitionId === 'string'
      ? configuration.formDefinitionId.trim()
      : '';
  if (!formDefinitionId) return json;
  return JSON.stringify({
    ...configuration,
    formDefinitionId,
    form: { ...DEFAULT_FORM_STAGE_POLICY, enabled: false },
  });
}

export function getAdmissionFormStageConfigurationError(
  json: string | undefined,
  forms: AdmissionForm[]
): string | undefined {
  if (json && json.length > 8000)
    return 'Shorten the stage settings to fit within 8,000 characters.';
  const configuration = readStageConfiguration(json);
  if (!configuration) return 'The stage settings are not valid JSON. Reopen the stage.';
  const formId =
    typeof configuration.formDefinitionId === 'string' ? configuration.formDefinitionId : '';
  if (!formId) return 'Select a published form version.';
  if (configuration.form === undefined) return undefined;
  const policy = readAdmissionFormStagePolicy(json);
  if (!policy)
    return 'These Form stage settings are unsupported or incomplete. Their saved values are preserved.';
  if (!policy.enabled) return undefined;
  if (
    policy.dueInDays != null &&
    (!Number.isInteger(policy.dueInDays) || policy.dueInDays < 1 || policy.dueInDays > 365)
  )
    return 'Set the due time between 1 and 365 days.';
  if (
    !Number.isInteger(policy.maxSubmissionAttempts) ||
    policy.maxSubmissionAttempts < 1 ||
    policy.maxSubmissionAttempts > 20
  )
    return 'Allow between 1 and 20 submission attempts.';
  if (policy.allowCorrectionRequests && policy.maxSubmissionAttempts < 2)
    return 'Allow at least two attempts when corrections are enabled.';
  if (
    policy.verificationSectionCodes.length > 30 ||
    new Set(policy.verificationSectionCodes).size !== policy.verificationSectionCodes.length
  )
    return 'Choose up to 30 unique sections for verification.';
  if (policy.requireSectionVerification && policy.verificationSectionCodes.length === 0)
    return 'Choose at least one section that staff must verify.';
  if (!policy.requireSectionVerification && policy.verificationSectionCodes.length > 0)
    return 'Clear section verification choices or enable verification.';
  const selectedForm = forms.find((form) => form.id === formId);
  const sectionCodes = new Set(selectedForm?.sections.map((section) => section.code) ?? []);
  if (policy.verificationSectionCodes.some((code) => !sectionCodes.has(code)))
    return 'A verification section is not part of the selected published form.';
  return undefined;
}
