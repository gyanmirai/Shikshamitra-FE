/** Keep policy identity consistent with server uniqueness, including archived policies. */
export const normalizePolicyName = (name: string) => name.trim().replace(/\s+/gu, ' ');

export const isDuplicatePolicyNameError = (code?: string) =>
  [
    'Finance:ConcessionPolicy:010005',
    'Finance:RefundPolicy:010005',
    'Finance:ProrationPolicy:010005',
    'Finance:CollectionPolicy:010034',
  ].includes(code || '');

export const DUPLICATE_POLICY_NAME_MESSAGE =
  'A policy with this name already exists in Current or Archived for this academic year. Use a different name or review the existing policy.';
