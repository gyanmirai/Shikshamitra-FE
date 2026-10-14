import { it, expect, describe } from 'vitest';

import { serializeRefundWorklistFilters } from './refundWorklistFilters';

describe('refund worklist filter requests', () => {
  it('omits filters after clearing them', () => {
    expect(serializeRefundWorklistFilters([])).toBeUndefined();
  });

  it('sends raw status and numeric values without UI labels', () => {
    expect(
      JSON.parse(
        serializeRefundWorklistFilters([
          {
            column: 'status',
            type: 'equals',
            value: 0,
            valueType: 'enum',
            displayValue: 'Pending',
          },
          {
            column: 'refundAmount',
            type: 'greaterThan',
            value: 2000,
            valueType: 'formattedNumber',
          },
        ])!
      )
    ).toEqual([
      { column: 'status', type: 'equals', value: 0 },
      { column: 'refundAmount', type: 'greaterThan', value: 2000 },
    ]);
  });

  it('sends the selected calendar day with its local timezone', () => {
    const result = JSON.parse(
      serializeRefundWorklistFilters([
        { column: 'requestDate', type: 'equals', value: '02-10-2026', valueType: 'date' },
      ])!
    );
    expect(result[0].value).toMatch(/^2026-10-02T00:00:00[+-]\d{2}:\d{2}$/);
  });
});
