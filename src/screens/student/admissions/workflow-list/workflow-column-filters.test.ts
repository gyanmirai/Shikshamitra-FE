import { it, expect, describe } from 'vitest';

import {
  workflowColumnFilters,
  workflowColumnFiltersRequest,
  serializeWorkflowColumnFilters,
} from './workflow-column-filters';

describe('workflow column filter contract', () => {
  it('round trips text, numeric range and displayed date predicates without presentation fields', () => {
    const filters = [
      { column: 'name', type: 'contains', value: 'Spring', valueType: 'string', label: 'Workflow' },
      {
        column: 'offeringCount',
        type: 'between',
        value: { min: '0', max: '3' },
        valueType: 'number',
      },
      { column: 'lastModificationTime', type: 'equals', value: '26-10-2026', valueType: 'date' },
      { column: 'publishedAt', type: 'before', value: '2026-11-01', valueType: 'date' },
      { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
    ];
    const serialized = serializeWorkflowColumnFilters(filters);
    expect(JSON.parse(serialized)).toEqual([
      { column: 'name', type: 'contains', value: 'Spring', valueType: 'string' },
      { column: 'offeringCount', type: 'between', value: { min: 0, max: 3 }, valueType: 'number' },
      { column: 'lastModificationTime', type: 'equals', value: '26-10-2026', valueType: 'date' },
      { column: 'publishedAt', type: 'before', value: '2026-11-01', valueType: 'date' },
    ]);
    expect(workflowColumnFilters(serialized)).toHaveLength(4);
  });

  it('adds selected local day and next day timezone offsets only to the API contract', () => {
    const serialized = serializeWorkflowColumnFilters([
      { column: 'publishedAt', type: 'equals', value: '26-10-2026', valueType: 'date' },
    ]);
    expect(JSON.parse(serialized)[0]).not.toHaveProperty('startOffsetMinutes');
    expect(JSON.parse(workflowColumnFiltersRequest(serialized))[0]).toEqual({
      column: 'publishedAt',
      type: 'equals',
      value: '26-10-2026',
      valueType: 'date',
      startOffsetMinutes: new Date(2026, 9, 26).getTimezoneOffset(),
      endOffsetMinutes: new Date(2026, 9, 27).getTimezoneOffset(),
    });
  });

  it('discards malformed URL filters and unsupported fields', () => {
    expect(workflowColumnFilters('not json')).toEqual([]);
    expect(
      workflowColumnFilters(
        JSON.stringify([
          { column: 'actions', type: 'contains', value: 'Edit', valueType: 'string' },
          { column: 'version', type: 'equals', value: -1, valueType: 'number' },
          { column: 'publishedAt', type: 'equals', value: '2026-02-30', valueType: 'date' },
        ])
      )
    ).toEqual([]);
  });
});
