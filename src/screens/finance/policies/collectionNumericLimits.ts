export const COLLECTION_MAX_AMOUNT = 999999;
export const COLLECTION_MAX_DAYS = 365;
export type CollectionNumericKind = 'days' | 'amount' | 'percentage';

export const numericMaximum = (kind: CollectionNumericKind) =>
  kind === 'days' ? COLLECTION_MAX_DAYS : kind === 'percentage' ? 100 : COLLECTION_MAX_AMOUNT;

/** An editable decimal draft; reject exponents, signs, extra digits and precision before storage. */
export function acceptsNumericDraft(value: string, kind: CollectionNumericKind): boolean {
  if (value === '') return true;
  const digits = kind === 'amount' ? 6 : 3;
  const pattern = kind === 'days' ? /^\d{1,3}$/ : new RegExp(`^\\d{1,${digits}}(?:\\.\\d{0,2})?$`);
  return (
    pattern.test(value) && Number.isFinite(Number(value)) && Number(value) <= numericMaximum(kind)
  );
}

export function validCollectionNumber(
  value: unknown,
  kind: CollectionNumericKind,
  minimum = 0
): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= numericMaximum(kind) &&
    (kind === 'days'
      ? Number.isInteger(value)
      : Math.abs(value * 100 - Math.round(value * 100)) < 0.000001)
  );
}
