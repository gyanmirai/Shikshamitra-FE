/** Add finite decimal inputs without imposing a decimal-place limit on displayed totals. */
export function sumDecimal(values: number[]): number {
  if (values.some((value) => !Number.isFinite(value))) return Number.NaN;
  const decimals = values.map((value) => {
    const [digits, exponent = '0'] = String(value).split('e');
    const fraction = digits.split('.')[1]?.length ?? 0;
    return { coefficient: BigInt(digits.replace('.', '')), scale: fraction - Number(exponent) };
  });
  const scale = Math.max(0, ...decimals.map((item) => item.scale));
  const sum = decimals.reduce(
    (value, item) => value + item.coefficient * BigInt(`1${'0'.repeat(scale - item.scale)}`),
    BigInt(0)
  );
  return Number(`${sum}e-${scale}`);
}
