import { readStageConfiguration } from './admission-assessment-policy';

export type AdmissionPaymentMethod =
  | 'cash' | 'cheque' | 'demandDraft' | 'bankTransfer' | 'creditCard' | 'debitCard' | 'upi' | 'onlineGateway';
export type AdmissionPaymentPolicy = {
  version: 1; enabled: boolean; purposeCode: string; purposeName: string; currency: string;
  amount: number; collectionMode: 'staff' | 'online' | 'either'; payer: 'applicant' | 'guardian' | 'either';
  acceptedMethods: AdmissionPaymentMethod[]; dueInDays: number | null; allowLatePayment: boolean;
  allowInstallments: boolean; minimumInstallmentAmount: number | null;
  requireIndependentVerification: boolean; allowWaiver: boolean; autoAdvanceOnSettlement: boolean;
};

export const STAFF_PAYMENT_METHODS: { value: AdmissionPaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' }, { value: 'cheque', label: 'Cheque' },
  { value: 'demandDraft', label: 'Demand draft' }, { value: 'bankTransfer', label: 'Bank transfer' },
  { value: 'creditCard', label: 'Credit card' }, { value: 'debitCard', label: 'Debit card' },
  { value: 'upi', label: 'UPI' },
];

export const DEFAULT_PAYMENT_POLICY: AdmissionPaymentPolicy = {
  version: 1, enabled: true, purposeCode: 'APPLICATION_FEE', purposeName: 'Application fee',
  currency: 'INR', amount: 500, collectionMode: 'staff', payer: 'either', acceptedMethods: ['cash', 'upi'],
  dueInDays: null, allowLatePayment: true, allowInstallments: false, minimumInstallmentAmount: null,
  requireIndependentVerification: false, allowWaiver: false, autoAdvanceOnSettlement: true,
};

const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

export function readAdmissionPaymentPolicy(json?: string): AdmissionPaymentPolicy | null {
  const value = readStageConfiguration(json)?.payment;
  if (!record(value) || value.version !== 1 || typeof value.enabled !== 'boolean') return null;
  const policy = { ...DEFAULT_PAYMENT_POLICY, ...value } as AdmissionPaymentPolicy;
  const booleans = ['allowLatePayment', 'allowInstallments', 'requireIndependentVerification', 'allowWaiver', 'autoAdvanceOnSettlement'] as const;
  if (booleans.some((key) => typeof policy[key] !== 'boolean') || !Array.isArray(policy.acceptedMethods)) return null;
  return policy;
}

export function writeAdmissionPaymentPolicy(json: string | undefined, policy: AdmissionPaymentPolicy) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previous = configuration.payment;
  if (previous !== undefined && !readAdmissionPaymentPolicy(json))
    throw new Error('These Payment settings are unsupported. Reload the workflow.');
  return JSON.stringify({ ...configuration, payment: { ...(record(previous) ? previous : {}), ...policy } });
}

export function getAdmissionPaymentConfigurationError(json?: string): string | undefined {
  const configuration = readStageConfiguration(json);
  if (!configuration) return 'The stage settings are not valid JSON. Reopen the stage.';
  if (configuration.payment === undefined) return undefined;
  const policy = readAdmissionPaymentPolicy(json);
  if (!policy) return 'These Payment settings are unsupported or incomplete.';
  if (!policy.enabled) return undefined;
  if (!/^[A-Z][A-Z0-9_]{1,31}$/.test(policy.purposeCode)) return 'Use 2–32 uppercase letters, numbers, or underscores for the purpose code.';
  if (!policy.purposeName.trim() || policy.purposeName.trim().length > 120) return 'Enter a purpose name up to 120 characters.';
  if (!/^[A-Z]{3}$/.test(policy.currency)) return 'Enter a three-letter currency code.';
  if (!Number.isFinite(policy.amount) || policy.amount < 0.01 || policy.amount > 10000000) return 'Enter an amount between 0.01 and 10,000,000.';
  if (!policy.acceptedMethods.length || new Set(policy.acceptedMethods).size !== policy.acceptedMethods.length) return 'Choose one or more unique payment methods.';
  if (policy.acceptedMethods.includes('onlineGateway')) return 'Configure a trusted admission payment gateway before enabling online collection.';
  if (policy.collectionMode !== 'staff') return 'Online admission collection needs a configured payment gateway.';
  if (policy.dueInDays != null && (!Number.isInteger(policy.dueInDays) || policy.dueInDays < 1 || policy.dueInDays > 365)) return 'Set the payment deadline between 1 and 365 days.';
  if (policy.allowInstallments && (!policy.minimumInstallmentAmount || policy.minimumInstallmentAmount < 0.01 || policy.minimumInstallmentAmount > policy.amount)) return 'Set a minimum installment between 0.01 and the required amount.';
  if (!policy.allowInstallments && policy.minimumInstallmentAmount != null) return 'Clear the minimum installment or enable installments.';
  return undefined;
}
