import { readStageConfiguration } from './admission-assessment-policy';

export type AdmissionOfferOutcome = 'accepted' | 'declined' | 'expired' | 'withdrawn';
export type AdmissionOfferPolicy = {
  version: 1; enabled: boolean; offerType: 'unconditional' | 'conditional'; title: string;
  message: string; terms: string | null; conditions: string | null; validityDays: number;
  allowExpiryOverride: boolean; minimumValidityDays: number; maximumValidityDays: number;
  requireTermsAcceptance: boolean; requireConditionsConfirmation: boolean;
  requireDeclineReason: boolean; allowExtension: boolean; maximumExtensions: number;
  allowReissue: boolean; maximumReissues: number; allowedCompletionOutcomes: AdmissionOfferOutcome[];
  autoAdvanceOnAcceptance: boolean;
};

export const DEFAULT_OFFER_POLICY: AdmissionOfferPolicy = {
  version: 1, enabled: true, offerType: 'unconditional', title: 'Admission offer',
  message: 'We are pleased to offer admission.', terms: null, conditions: null, validityDays: 14,
  allowExpiryOverride: true, minimumValidityDays: 1, maximumValidityDays: 90,
  requireTermsAcceptance: true, requireConditionsConfirmation: false, requireDeclineReason: true,
  allowExtension: true, maximumExtensions: 2, allowReissue: true, maximumReissues: 1,
  allowedCompletionOutcomes: ['accepted', 'declined'], autoAdvanceOnAcceptance: true,
};

const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

export function readAdmissionOfferPolicy(json?: string): AdmissionOfferPolicy | null {
  const value = readStageConfiguration(json)?.offer;
  if (!record(value) || value.version !== 1 || typeof value.enabled !== 'boolean') return null;
  const policy = { ...DEFAULT_OFFER_POLICY, ...value } as AdmissionOfferPolicy;
  if (!Array.isArray(policy.allowedCompletionOutcomes)) return null;
  return policy;
}

export function writeAdmissionOfferPolicy(json: string | undefined, policy: AdmissionOfferPolicy) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previous = configuration.offer;
  if (previous !== undefined && !readAdmissionOfferPolicy(json))
    throw new Error('These Offer settings are unsupported. Reload the workflow.');
  return JSON.stringify({ ...configuration, offer: { ...(record(previous) ? previous : {}), ...policy } });
}

export function getAdmissionOfferConfigurationError(json?: string): string | undefined {
  const configuration = readStageConfiguration(json);
  if (!configuration) return 'The stage settings are not valid JSON. Reopen the stage.';
  if (configuration.offer === undefined) return undefined;
  const p = readAdmissionOfferPolicy(json);
  if (!p) return 'These Offer settings are unsupported or incomplete.';
  if (!p.enabled) return undefined;
  if (!p.title.trim() || p.title.trim().length > 160) return 'Enter an offer title up to 160 characters.';
  if (!p.message.trim() || p.message.trim().length > 4000) return 'Enter an offer message up to 4,000 characters.';
  if ((p.terms?.length ?? 0) > 8000) return 'Offer terms cannot exceed 8,000 characters.';
  if (p.offerType === 'conditional' && !p.conditions?.trim()) return 'Describe the conditional offer requirements.';
  if ((p.conditions?.length ?? 0) > 4000) return 'Offer conditions cannot exceed 4,000 characters.';
  if (p.offerType === 'unconditional' && p.requireConditionsConfirmation) return 'Conditions confirmation requires a conditional offer.';
  if (![p.validityDays, p.minimumValidityDays, p.maximumValidityDays].every(Number.isInteger) ||
    p.minimumValidityDays < 1 || p.maximumValidityDays > 365 ||
    p.minimumValidityDays > p.validityDays || p.validityDays > p.maximumValidityDays)
    return 'Keep default offer validity inside its 1–365 day override range.';
  if (!p.allowExpiryOverride && (p.minimumValidityDays !== p.validityDays || p.maximumValidityDays !== p.validityDays))
    return 'When expiry override is off, both validity limits must match the default.';
  if (!Number.isInteger(p.maximumExtensions) || p.maximumExtensions < 0 || p.maximumExtensions > 20 || (!p.allowExtension && p.maximumExtensions !== 0))
    return 'Set 0–20 extensions and enable extensions before allowing them.';
  if (!Number.isInteger(p.maximumReissues) || p.maximumReissues < 0 || p.maximumReissues > 10 || (!p.allowReissue && p.maximumReissues !== 0))
    return 'Set 0–10 reissues and enable reissue before allowing them.';
  const outcomes = p.allowedCompletionOutcomes;
  if (!outcomes.length || new Set(outcomes).size !== outcomes.length || outcomes.some((value) => !['accepted', 'declined', 'expired', 'withdrawn'].includes(value)))
    return 'Choose one or more unique supported completion outcomes.';
  return undefined;
}
