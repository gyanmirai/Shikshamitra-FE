import { it, expect, describe } from 'vitest';
import { ConcessionStatusType } from 'src/enums/concession-status-type';

import {
  concessionStatusLabel,
  concessionStatusColor,
  concessionStatusOptions,
  expandConcessionStatusFilters,
} from './concessionTablePresentation';

describe('concession operational statuses', () => {
  it('offers only the three displayed statuses', () => {
    expect(concessionStatusOptions()).toEqual([
      { label: 'Pending', value: 0 },
      { label: 'Approved', value: 1 },
      { label: 'Rejected', value: 2 },
    ]);
  });
  it.each([
    [ConcessionStatusType.Draft, 'Pending', 'warning'],
    [ConcessionStatusType.Pending, 'Pending', 'warning'],
    [ConcessionStatusType.Approved, 'Approved', 'success'],
    [ConcessionStatusType.PartiallyReversed, 'Approved', 'success'],
    [ConcessionStatusType.Reversed, 'Approved', 'success'],
    [ConcessionStatusType.Rejected, 'Rejected', 'error'],
    [ConcessionStatusType.Cancelled, 'Rejected', 'error'],
  ])('displays workflow status %s as %s', (value, label, color) => {
    expect(concessionStatusLabel(Number(value))).toBe(label);
    expect(concessionStatusColor(Number(value))).toBe(color);
  });
  it('includes drafts when filtering Pending without changing unrelated criteria', () => {
    expect(expandConcessionStatusFilters([
      { column: 'studentIdentity', type: 'contains', value: 'Aanya', valueType: 'string' },
      { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
    ])).toEqual([
      { column: 'studentIdentity', type: 'contains', value: 'Aanya', valueType: 'string' },
      { column: 'status', type: 'equals', value: 6, valueType: 'enum' },
      { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
    ]);
  });
});
