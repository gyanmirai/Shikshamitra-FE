import { readStageConfiguration } from './admission-assessment-policy';

export type AdmissionPaymentCompletionPolicy = {
  version: 1;
  paymentRule: 'partial' | 'full';
  allowCollectionLater: boolean;
};

export const DEFAULT_PAYMENT_COMPLETION_POLICY: AdmissionPaymentCompletionPolicy = {
  version: 1,
  paymentRule: 'partial',
  allowCollectionLater: true,
};

export function readPaymentCompletionPolicy(
  json?: string
): AdmissionPaymentCompletionPolicy | null {
  const configuration = readStageConfiguration(json);
  if (!configuration) return null;
  if (configuration.paymentCompletion === undefined)
    return { ...DEFAULT_PAYMENT_COMPLETION_POLICY };
  const value = configuration.paymentCompletion;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const policy = { ...DEFAULT_PAYMENT_COMPLETION_POLICY, ...value };
  return policy.version === 1 &&
    (policy.paymentRule === 'partial' || policy.paymentRule === 'full') &&
    typeof policy.allowCollectionLater === 'boolean'
    ? (policy as AdmissionPaymentCompletionPolicy)
    : null;
}

export function writePaymentCompletionPolicy(
  json: string | undefined,
  policy: AdmissionPaymentCompletionPolicy
) {
  const configuration = readStageConfiguration(json);
  if (!configuration || !readPaymentCompletionPolicy(json))
    throw new Error('These Payment completion settings are unsupported. Reload the workflow.');
  const previous = configuration.paymentCompletion;
  return JSON.stringify({
    ...configuration,
    paymentCompletion: {
      ...(previous && typeof previous === 'object' && !Array.isArray(previous) ? previous : {}),
      ...policy,
    },
  });
}
