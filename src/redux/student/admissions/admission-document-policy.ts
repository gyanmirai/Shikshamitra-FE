import { readStageConfiguration } from './admission-assessment-policy';

export type AdmissionDocumentRequirementPolicy = {
  code: string;
  name: string;
  description?: string | null;
  requirement: 'required' | 'optional' | 'conditional';
  conditionJson?: string | null;
  collectionMode: 'upload' | 'original' | 'either' | 'both';
  allowedExtensions: string[];
  maxFileSizeMb: number;
  documentTypeId?: string | null;
};

export type AdmissionDocumentPolicy = {
  version: 1;
  enabled: boolean;
  allowWaivers: boolean;
  requireIndependentReview: boolean;
  requirements: AdmissionDocumentRequirementPolicy[];
};

export const DOCUMENT_FORMATS = ['pdf', 'jpg', 'jpeg', 'png'];
export const DEFAULT_DOCUMENT_POLICY: AdmissionDocumentPolicy = {
  version: 1,
  enabled: true,
  allowWaivers: false,
  requireIndependentReview: false,
  requirements: [],
};

export function createDocumentRequirement(
  code: string,
  name = ''
): AdmissionDocumentRequirementPolicy {
  return {
    code,
    name,
    requirement: 'required',
    collectionMode: 'upload',
    allowedExtensions: [...DOCUMENT_FORMATS],
    maxFileSizeMb: 10,
  };
}

function isRequirement(value: unknown): value is AdmissionDocumentRequirementPolicy {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    ['code', 'name', 'requirement', 'collectionMode'].every(
      (key) => typeof item[key] === 'string'
    ) &&
    ['description', 'conditionJson', 'documentTypeId'].every(
      (key) => item[key] == null || typeof item[key] === 'string'
    ) &&
    typeof item.maxFileSizeMb === 'number' &&
    Number.isFinite(item.maxFileSizeMb) &&
    Array.isArray(item.allowedExtensions) &&
    item.allowedExtensions.every((format) => typeof format === 'string')
  );
}

export function readAdmissionDocumentPolicy(json?: string): AdmissionDocumentPolicy | null {
  const value = readStageConfiguration(json)?.documentVerification;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const policy = value as Record<string, unknown>;
  if (
    policy.version !== 1 ||
    ['enabled', 'allowWaivers', 'requireIndependentReview'].some(
      (key) => typeof policy[key] !== 'boolean'
    )
  )
    return null;
  if (!Array.isArray(policy.requirements) || !policy.requirements.every(isRequirement)) return null;
  return policy as AdmissionDocumentPolicy;
}

export function writeAdmissionDocumentPolicy(
  json: string | undefined,
  policy: AdmissionDocumentPolicy
) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previous = readAdmissionDocumentPolicy(json);
  if (configuration.documentVerification !== undefined && !previous) {
    throw new Error('These document settings are unsupported or incomplete. Reload the workflow.');
  }
  return JSON.stringify({ ...configuration, documentVerification: { ...previous, ...policy } });
}
