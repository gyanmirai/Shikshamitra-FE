import { readStageConfiguration } from './admission-assessment-policy';

export type AdmissionReviewPrerequisite = {
  kind: 'assessment' | 'documents' | 'eligibility';
  sourceStageCode: string;
};
export type AdmissionReviewChecklistItem = { code: string; name: string; required: boolean };
export type AdmissionReviewPolicy = {
  version: 1;
  enabled: boolean;
  reviewerRole: string | null;
  assignedReviewerId: string | null;
  requireIndependentApprover: boolean;
  approverRole: string | null;
  dueInDays: number | null;
  prerequisites: AdmissionReviewPrerequisite[];
  checklist: AdmissionReviewChecklistItem[];
};

export const DEFAULT_REVIEW_POLICY: AdmissionReviewPolicy = {
  version: 1,
  enabled: true,
  reviewerRole: null,
  assignedReviewerId: null,
  requireIndependentApprover: false,
  approverRole: null,
  dueInDays: null,
  prerequisites: [],
  checklist: [],
};

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function readAdmissionReviewPolicy(json?: string): AdmissionReviewPolicy | null {
  const policy = readStageConfiguration(json)?.review;
  if (
    !record(policy) ||
    policy.version !== 1 ||
    typeof policy.enabled !== 'boolean' ||
    (policy.requireIndependentApprover !== undefined &&
      typeof policy.requireIndependentApprover !== 'boolean') ||
    ['reviewerRole', 'assignedReviewerId', 'approverRole'].some(
      (key) => policy[key] != null && typeof policy[key] !== 'string'
    ) ||
    (policy.dueInDays != null && typeof policy.dueInDays !== 'number') ||
    (policy.prerequisites !== undefined &&
      (!Array.isArray(policy.prerequisites) ||
        !policy.prerequisites.every(
          (item) =>
            record(item) &&
            ['assessment', 'documents', 'eligibility'].includes(String(item.kind)) &&
            typeof item.sourceStageCode === 'string'
        ))) ||
    (policy.checklist !== undefined &&
      (!Array.isArray(policy.checklist) ||
        !policy.checklist.every(
          (item) =>
            record(item) &&
            typeof item.code === 'string' &&
            typeof item.name === 'string' &&
            (item.required === undefined || typeof item.required === 'boolean')
        )))
  )
    return null;
  const normalized = { ...DEFAULT_REVIEW_POLICY, ...policy } as AdmissionReviewPolicy;
  return {
    ...normalized,
    checklist: normalized.checklist.map((item) => ({ ...item, required: item.required ?? false })),
  };
}

export function writeAdmissionReviewPolicy(
  json: string | undefined,
  policy: AdmissionReviewPolicy
) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previous = readAdmissionReviewPolicy(json);
  if (configuration.review !== undefined && !previous) {
    throw new Error('These review settings are unsupported or incomplete. Reload the workflow.');
  }
  return JSON.stringify({ ...configuration, review: { ...previous, ...policy } });
}
