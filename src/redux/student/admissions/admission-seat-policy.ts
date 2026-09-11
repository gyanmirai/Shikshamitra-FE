import { readStageConfiguration } from './admission-assessment-policy';

export type AdmissionSeatOutcome = 'confirmed' | 'waitlisted' | 'released' | 'expired';
export type AdmissionSeatPolicy = {
  version: 1; enabled: boolean; defaultCapacity: number; reservationMode: 'manual' | 'onEntry';
  reservationDurationHours: number; allowDurationOverride: boolean; minimumDurationHours: number;
  maximumDurationHours: number; allowRenewal: boolean; maximumRenewals: number;
  allowWaitlist: boolean; allowCapacityOverride: boolean; requireReleaseReason: boolean;
  allowedCompletionOutcomes: AdmissionSeatOutcome[]; autoAdvanceOnConfirmation: boolean;
};

export const DEFAULT_SEAT_POLICY: AdmissionSeatPolicy = {
  version: 1, enabled: true, defaultCapacity: 40, reservationMode: 'manual',
  reservationDurationHours: 72, allowDurationOverride: false,
  minimumDurationHours: 72, maximumDurationHours: 72,
  allowRenewal: true, maximumRenewals: 1, allowWaitlist: true,
  allowCapacityOverride: false, requireReleaseReason: true,
  allowedCompletionOutcomes: ['confirmed'], autoAdvanceOnConfirmation: true,
};

const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

export function readAdmissionSeatPolicy(json?: string): AdmissionSeatPolicy | null {
  const value = readStageConfiguration(json)?.seat;
  if (!record(value) || value.version !== 1 || typeof value.enabled !== 'boolean') return null;
  const policy = { ...DEFAULT_SEAT_POLICY, ...value } as AdmissionSeatPolicy;
  return Array.isArray(policy.allowedCompletionOutcomes) ? policy : null;
}

export function writeAdmissionSeatPolicy(json: string | undefined, policy: AdmissionSeatPolicy) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previous = configuration.seat;
  if (previous !== undefined && !readAdmissionSeatPolicy(json))
    throw new Error('These Seat settings are unsupported. Reload the workflow.');
  return JSON.stringify({ ...configuration, seat: { ...(record(previous) ? previous : {}), ...policy } });
}

export function getAdmissionSeatConfigurationError(json?: string): string | undefined {
  const configuration = readStageConfiguration(json);
  if (!configuration) return 'The stage settings are not valid JSON. Reopen the stage.';
  if (configuration.seat === undefined) return undefined;
  const policy = readAdmissionSeatPolicy(json);
  if (!policy) return 'These Seat settings are unsupported or incomplete.';
  if (!policy.enabled) return undefined;
  if (!Number.isInteger(policy.defaultCapacity) || policy.defaultCapacity < 1 || policy.defaultCapacity > 100000)
    return 'Set a default capacity between 1 and 100,000.';
  if (!['manual', 'onEntry'].includes(policy.reservationMode)) return 'Choose manual reservation or reservation on stage entry.';
  const durations = [policy.reservationDurationHours, policy.minimumDurationHours, policy.maximumDurationHours];
  if (!durations.every(Number.isInteger) || policy.minimumDurationHours < 1 || policy.maximumDurationHours > 2160 ||
    policy.minimumDurationHours > policy.reservationDurationHours || policy.reservationDurationHours > policy.maximumDurationHours)
    return 'Keep the default reservation duration inside its 1–2,160 hour range.';
  if (!policy.allowDurationOverride && (policy.minimumDurationHours !== policy.reservationDurationHours ||
    policy.maximumDurationHours !== policy.reservationDurationHours))
    return 'When duration override is off, both duration limits must match the default.';
  if (!Number.isInteger(policy.maximumRenewals) || policy.maximumRenewals < 0 || policy.maximumRenewals > 20 ||
    (!policy.allowRenewal && policy.maximumRenewals !== 0)) return 'Set 0–20 renewals and enable renewal before allowing them.';
  const outcomes = policy.allowedCompletionOutcomes;
  if (!outcomes.includes('confirmed') || new Set(outcomes).size !== outcomes.length ||
    outcomes.some((value) => !['confirmed', 'waitlisted', 'released', 'expired'].includes(value)))
    return 'Choose unique supported outcomes and include Confirmed.';
  if (!policy.allowWaitlist && outcomes.includes('waitlisted')) return 'Enable the waitlist before allowing it to complete the stage.';
  return undefined;
}
