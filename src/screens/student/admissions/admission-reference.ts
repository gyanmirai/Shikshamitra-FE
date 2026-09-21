const ADMISSION_REFERENCE = /^(INQ|APP|FAM)[/-](\d{4})[/-]([a-z0-9]+)$/i;

export function formatAdmissionReference(value?: string | null) {
  if (!value) return 'Not assigned';
  const match = ADMISSION_REFERENCE.exec(value.trim());
  if (!match) return value;

  const [, prefix, year, rawSequence] = match;
  const sequence = /^\d+$/.test(rawSequence)
    ? rawSequence.padStart(6, '0')
    : rawSequence.slice(0, 6).toUpperCase();
  return `${prefix.toUpperCase()}-${year}-${sequence}`;
}
