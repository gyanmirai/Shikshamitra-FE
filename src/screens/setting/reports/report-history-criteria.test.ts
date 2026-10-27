import { it, expect, describe } from 'vitest';

import { reportHistoryFilters } from './report-history-criteria';

describe('report history criteria', () => {
  it('serializes a local date-time filter as the same UTC minute', () => {
    expect(reportHistoryFilters([{ column: 'creationTime', type: 'equals', value: '27-10-2026 11:35', valueType: 'dateTime' }]))
      .toEqual([{ column: 'creationTime', type: 'equals', value: new Date(2026, 9, 27, 11, 35).toISOString() }]);
  });
  it('preserves alternative criteria for the same column', () => {
    expect(reportHistoryFilters([
      { column: 'status', type: 'equals', value: 'Queued', valueType: 'string' },
      { column: 'status', type: 'equals', value: 'Completed', valueType: 'string' },
    ])).toEqual([{ column: 'status', type: 'equals', value: 'Queued' }, { column: 'status', type: 'equals', value: 'Completed' }]);
  });
  it('rejects unsupported columns and invalid date input before sending a request', () => {
    expect(() => reportHistoryFilters([{ column: 'requestJson', type: 'contains', value: 'secret', valueType: 'string' }])).toThrow('supported report history');
    expect(() => reportHistoryFilters([{ column: 'creationTime', type: 'equals', value: 'invalid', valueType: 'dateTime' }])).toThrow('valid report history date');
  });
});
