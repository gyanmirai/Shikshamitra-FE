export type AdmissionAssessmentPolicy = {
  version: 1;
  enabled: boolean;
  schedulingEnabled: boolean;
  attendanceRequired: boolean;
  scoringEnabled: boolean;
  totalMarks: number;
  passingMarks: number;
  reviewRequired: boolean;
  maxAttempts: number;
};

export const DEFAULT_ASSESSMENT_POLICY: AdmissionAssessmentPolicy = {
  version: 1,
  enabled: true,
  schedulingEnabled: false,
  attendanceRequired: false,
  scoringEnabled: true,
  totalMarks: 100,
  passingMarks: 40,
  reviewRequired: false,
  maxAttempts: 1,
};

export function readStageConfiguration(json?: string): Record<string, unknown> | null {
  if (!json) return {};
  try {
    const value: unknown = JSON.parse(json);
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function readAdmissionAssessmentPolicy(json?: string): AdmissionAssessmentPolicy | null {
  const value = readStageConfiguration(json)?.assessment;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const policy = value as Record<string, unknown>;
  if (policy.version !== 1) return null;
  const booleans = [
    'enabled',
    'schedulingEnabled',
    'attendanceRequired',
    'scoringEnabled',
    'reviewRequired',
  ];
  const numbers = ['totalMarks', 'passingMarks', 'maxAttempts'];
  if (booleans.some((key) => typeof policy[key] !== 'boolean')) return null;
  if (numbers.some((key) => typeof policy[key] !== 'number' || !Number.isFinite(policy[key])))
    return null;
  return policy as AdmissionAssessmentPolicy;
}

export function writeAdmissionAssessmentPolicy(
  json: string | undefined,
  policy: AdmissionAssessmentPolicy
) {
  const configuration = readStageConfiguration(json);
  if (!configuration)
    throw new Error('The stage configuration could not be read. Reopen the stage.');
  const previous = configuration.assessment;
  if (previous !== undefined && !readAdmissionAssessmentPolicy(json)) {
    throw new Error(
      'These assessment settings are unsupported or incomplete. Reload the workflow.'
    );
  }
  const extra =
    previous && typeof previous === 'object' && !Array.isArray(previous) ? previous : {};
  return JSON.stringify({ ...configuration, assessment: { ...extra, ...policy } });
}

export function getAssessmentConfigurationError(json?: string): string | undefined {
  const configuration = readStageConfiguration(json);
  if (!configuration)
    return 'The stage settings could not be read. Reopen the stage before saving.';
  if (configuration.assessment === undefined) return undefined;
  const policy = readAdmissionAssessmentPolicy(json);
  if (!policy)
    return 'These assessment settings are unsupported or incomplete. Reload the workflow.';
  if (!policy.enabled) return undefined;
  if (!Number.isInteger(policy.maxAttempts) || policy.maxAttempts < 1 || policy.maxAttempts > 10) {
    return 'Enter a maximum of 1 to 10 attempts, including the first assessment.';
  }
  if (policy.scoringEnabled && (policy.totalMarks <= 0 || policy.totalMarks > 10000)) {
    return 'Total marks must be greater than zero and no more than 10,000.';
  }
  if (
    policy.scoringEnabled &&
    (policy.passingMarks < 0 || policy.passingMarks > policy.totalMarks)
  ) {
    return 'Passing marks must be between zero and the total marks.';
  }
  return undefined;
}
