import { it, expect, describe } from 'vitest';

import { cycleColumnFilters, serializeCycleColumnFilters } from './admission-cycle-column-filters';

describe('admission cycle column criteria', () => {
  it.each([
    { column: 'name', type: 'contains', value: { text: 'x' }, valueType: 'string' },
    { column: 'name', type: 'greaterThan', value: 'x', valueType: 'string' },
    { column: 'startDate', type: 'equals', value: '31-02-2027', valueType: 'date' },
    { column: 'applicationCount', type: 'equals', value: -1, valueType: 'number' },
    { column: 'applicationCount', type: 'between', value: { min: 5, max: 2 }, valueType: 'number' },
    { column: 'linkedOfferingCount', type: 'equals', value: 1.5, valueType: 'number' },
  ])('keeps malformed URL values out of shared filter chips: $column $type', (filter) => {
    expect(cycleColumnFilters(JSON.stringify([filter]))).toEqual([]);
  });

  it('round-trips zero and ranges without presentation labels in the API contract', () => {
    const raw =
      '[{"column":"linkedOfferingCount","type":"equals","value":0,"valueType":"number"},{"column":"applicationCount","type":"between","value":{"min":0,"max":12},"valueType":"number"}]';
    const filters = cycleColumnFilters(raw);
    expect(filters[0]).toMatchObject({ label: 'Offerings', value: 0 });
    expect(serializeCycleColumnFilters(filters)).toBe(raw);
  });
});
