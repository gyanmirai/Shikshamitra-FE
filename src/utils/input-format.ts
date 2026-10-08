export function capitalizeWords(input: string): string {
  return input
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}

export function toLettersTitleCase(input: string): string {
  const sanitized = input.replace(/[^a-zA-Z\s]/g, '');
  return sanitized
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''))
    .join(' ');
}

export function toAlphanumericTitleCase(input: string): string {
  const sanitized = input.replace(/[^a-zA-Z0-9\s]/g, '');
  return sanitized
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''))
    .join(' ');
}

export function toNumericWithMax(input: string, maxLength: number): string {
  const digitsOnly = input.replace(/\D/g, '');
  return digitsOnly.slice(0, Math.max(0, maxLength));
}

export function toUpperWithMax(input: string, maxLength: number): string {
  const upper = input.toUpperCase();
  return upper.slice(0, Math.max(0, maxLength));
}
