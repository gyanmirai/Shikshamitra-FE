/** Ceiling for money, ignoring binary arithmetic noise around a whole rupee. */
export function roundUpAmount(value: number): number {
  const nearest = Math.round(value);
  const tolerance = Math.max(1, Math.abs(value)) * Number.EPSILON * 8;
  return nearest !== 0 && Math.abs(value - nearest) <= tolerance ? nearest : Math.ceil(value);
}

/** Whole rupees bounded by an eligible balance or a hard policy cap. */
export function roundUpWithinAmount(value: number, maximum: number): number {
  return Math.max(0, Math.min(roundUpAmount(value), Math.floor(maximum)));
}
