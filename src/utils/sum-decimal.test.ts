import { it, expect, describe } from 'vitest';

import { sumDecimal } from './sum-decimal';

describe('sumDecimal', () => {
  it('retains decimal marks and exponent notation without restricting their precision', () => {
    expect(sumDecimal([0.1, 0.2])).toBe(0.3);
    expect(sumDecimal([0.005, 0.005])).toBe(0.01);
    expect(sumDecimal([1e-7, 2e-7])).toBe(3e-7);
    expect(sumDecimal([-0.1, 0.2])).toBe(0.1);
    expect(sumDecimal([])).toBe(0);
    expect(sumDecimal([1, Number.NaN])).toBeNaN();
  });
});
