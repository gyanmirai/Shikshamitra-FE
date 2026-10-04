/** Bank lookup labels use redacted identifiers; never fall back to a full account number. */
export interface BankAccountOptionResponse {
  id: string;
  label?: string | null;
  bankName?: string | null;
  maskedAccountNumber?: string | null;
  accountHolderName?: string | null;
}

const availableText = (value: string | null | undefined): string | undefined => {
  const text = value?.trim();
  return text && !/^(null|undefined)$/i.test(text) ? text : undefined;
};

const normalizeLabel = (value: string | null | undefined): string | undefined => {
  const text = availableText(value);
  if (!text) return undefined;

  // Split label separators, preserving meaningful hyphens inside bank/account names.
  // The final alternative also repairs legacy labels such as "SBI-null".
  const parts = text.split(/(\s+-\s*|\s*[•|]\s*|-(?=(?:null|undefined)?\s*$))/i);
  let label = '';
  for (let index = 0; index < parts.length; index += 2) {
    const part = availableText(parts[index]);
    if (part) label += `${label ? parts[index - 1] : ''}${part}`;
  }
  return label || undefined;
};

export const bankAccountOptionLabel = (account: BankAccountOptionResponse): string => {
  const label = normalizeLabel(account.label);
  // The routing endpoint owns safe, complete labels. Preserve these verbatim, including
  // its masked/last-four identifier, instead of requesting sensitive master-data fields.
  if (label && label === account.label?.trim()) return label;

  // Compatibility for missing/malformed labels and redacted BankAccountResponse records.
  const bankName = availableText(account.bankName) ?? label;
  const identifier =
    availableText(account.maskedAccountNumber) ?? availableText(account.accountHolderName);
  return [bankName, identifier].filter(Boolean).join(' - ') || 'Bank account (details unavailable)';
};
