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
  standardIds?: string[] | null;
};

export type AdmissionDocumentPolicy = {
  version: 1;
  enabled: boolean;
  allowWaivers: boolean;
  requireIndependentReview: boolean;
  collectionFormStageCode?: string | null;
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

export function assignMissingDocumentCodes(
  requirements: AdmissionDocumentRequirementPolicy[]
): AdmissionDocumentRequirementPolicy[] {
  const codes = new Set(requirements.map((item) => item.code.trim().toUpperCase()).filter(Boolean));
  return requirements.map((item) => {
    if (item.code.trim()) return item;
    const suffixName = item.name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const stem = `DOC_${suffixName}`.slice(0, 54);
    let code = stem;
    let suffix = 2;
    while (codes.has(code)) {
      code = `${stem}_${suffix}`;
      suffix += 1;
    }
    codes.add(code);
    return { ...item, code };
  });
}

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
    (item.standardIds == null ||
      (Array.isArray(item.standardIds) &&
        item.standardIds.every((id) => typeof id === 'string'))) &&
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
  if (policy.collectionFormStageCode != null && typeof policy.collectionFormStageCode !== 'string')
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
