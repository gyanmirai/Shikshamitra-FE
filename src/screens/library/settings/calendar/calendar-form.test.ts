import { it, expect, describe } from 'vitest';

import { closureSchema, calculationSchema } from './calendar-form';

describe('calendar form validation', () => {
  it('rejects reversed closure ranges and requires an audit reason', async () => {
    await expect(
      closureSchema.validate({
        fromDate: '2026-12-24',
        toDate: '2026-12-20',
        reason: 'Winter break',
      })
    ).rejects.toThrow('end');
    await expect(
      closureSchema.validate({ fromDate: '2026-12-24', toDate: '2026-12-26', reason: '' })
    ).rejects.toThrow('required');
  });
  it('accepts a zero-day preview but rejects negative, fractional or unbounded durations', async () => {
    const draft = { startDate: '2026-11-16', days: '0', dayCountingMode: 0 };
    await expect(calculationSchema.validate(draft)).resolves.toBeDefined();
    await Promise.all(
      ['-1', '1.5', '3661'].map(async (days) =>
        expect(calculationSchema.validate({ ...draft, days })).rejects.toThrow()
      )
    );
  });
});
