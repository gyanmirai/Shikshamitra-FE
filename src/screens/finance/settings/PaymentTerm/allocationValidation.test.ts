import { describe, expect, it } from 'vitest';

import { getAllocationSummary } from './allocationValidation';

describe('payment-term allocation feedback', () => {
  it('accepts hundredths that total exactly 100 without floating point noise', () => {
    expect(
      getAllocationSummary(
        [33.33, 33.33, 33.34].map((allocationPercentage) => ({ allocationPercentage }))
      )
    ).toEqual({ valid: true, message: '' });
  });

  it('gives a single actionable message for over and under allocations', () => {
    expect(getAllocationSummary([{ allocationPercentage: '101.63' }])).toEqual({
      valid: false,
      message:
        'Allocation total is 101.63%. Reduce the allocation by 1.63% so the total equals 100%.',
    });
    expect(getAllocationSummary([{ allocationPercentage: '99.99' }]).valid).toBe(false);
    expect(getAllocationSummary([{ allocationPercentage: '' }]).message).toContain(
      'Increase the allocation by 100.00%'
    );
  });
});
