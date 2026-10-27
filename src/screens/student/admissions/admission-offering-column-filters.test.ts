import { it, expect, describe } from 'vitest';

import { offeringScopeChanges, offeringColumnFilters, serializeOfferingColumnFilters } from './admission-offering-column-filters';

describe('Offering column criteria', () => {
  it('serializes only supported displayed fields and normalizes numeric ranges', () => {
    const filters = [
      { column: 'applicationCount', type: 'between', value: { min: '0', max: '12' }, valueType: 'number' },
      { column: 'workflowName', type: 'contains', value: 'General', valueType: 'string' },
    ];
    expect(JSON.parse(serializeOfferingColumnFilters(filters))).toEqual([
      { column: 'applicationCount', type: 'between', value: { min: 0, max: 12 }, valueType: 'number' },
    ]);
  });
  it('rejects malformed dates, negative counts, unknown fields and invalid JSON', () => {
    expect(offeringColumnFilters('invalid')).toEqual([]);
    expect(offeringColumnFilters(JSON.stringify([
      { column: 'effectiveOpenDate', type: 'equals', value: '31-02-2027', valueType: 'date' },
      { column: 'applicationCount', type: 'equals', value: -1, valueType: 'number' },
      { column: 'workflowName', type: 'contains', value: 'General', valueType: 'string' },
    ]))).toEqual([]);
  });
  it('maps academic and status criteria into the same top selector values and clears children', () => {
    expect(offeringScopeChanges([
      { column: 'boardName', type: 'equals', value: 'board-2', valueType: 'enum' },
      { column: 'configurationStatus', type: 'equals', value: 0, valueType: 'enum' },
    ], { boardId: 'board-1', mediumId: 'medium-1' })).toMatchObject({
      boardId: 'board-2', mediumId: '', stageId: '', standardId: '', configurationStatus: '0',
    });
  });
});
