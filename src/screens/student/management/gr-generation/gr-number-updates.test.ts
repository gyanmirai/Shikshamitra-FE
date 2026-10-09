import { it, expect, describe } from 'vitest';

import { getGrNumberChanges, hasAssignedGrNumber, buildGrNumberUpdates } from './gr-number-updates';

describe('Records GR updates', () => {
  it('preserves an unchanged formatted GR when its legacy integer is absent', () => {
    const original = [{ studentId: 'formatted', grNumber: 'GR-1001', grNo: null }];
    expect(hasAssignedGrNumber(original[0])).toBe(true);
    expect(buildGrNumberUpdates(getGrNumberChanges(original, original), {})).toEqual([]);
  });

  it('sends only changed numbers and does not request a reason for first assignment', () => {
    const original = [
      { studentId: 'new', grNo: null },
      { studentId: 'existing', grNo: 1001 },
    ];
    const current = [{ studentId: 'new', grNo: 1002 }, original[1]];
    const changes = getGrNumberChanges(current, original);
    expect(changes).toHaveLength(1);
    expect(changes[0].requiresReason).toBe(false);
    expect(buildGrNumberUpdates(changes, {})).toEqual([{ studentId: 'new', grNo: 1002 }]);
  });

  it('requires and trims a reason for a numeric correction after assignment', () => {
    const original = [{ studentId: 'existing', grNo: 1001, grNumber: '1001' }];
    const changes = getGrNumberChanges([{ ...original[0], grNo: 1002 }], original);
    expect(changes[0].requiresReason).toBe(true);
    expect(buildGrNumberUpdates(changes, { existing: ' Correct transcription ' })).toEqual([
      { studentId: 'existing', grNo: 1002, reason: 'Correct transcription' },
    ]);
  });

  it('treats canonical-only numeric replacement as a correction, including clearing', () => {
    const original = [{ studentId: 'existing', grNo: null, grNumber: 'GR-1001' }];
    expect(getGrNumberChanges([{ ...original[0], grNo: 1002 }], original)[0].requiresReason).toBe(
      true
    );
    const assigned = [{ studentId: 'numeric', grNo: 1001 }];
    const changes = getGrNumberChanges([{ studentId: 'numeric', grNo: null }], assigned);
    expect(changes[0].requiresReason).toBe(true);
    expect(
      buildGrNumberUpdates(changes, { numeric: 'Remove incorrect number' })[0].grNo
    ).toBeNull();
  });
});
