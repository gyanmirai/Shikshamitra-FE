import { it, expect, describe } from 'vitest';

import { directoryScope, directoryBulkScopeReady } from './student-directory-scope';

const options = {
  academicYears: [],
  boards: [
    { id: 'b1', name: 'GSEB' },
    { id: 'b2', name: 'CBSE' },
  ],
  mediums: [
    { id: 'm1', name: 'Gujarati', parentId: 'b1' },
    { id: 'm2', name: 'English', parentId: 'b2' },
  ],
  standards: [
    { id: 'c1', name: 'Class 1', parentId: 'm1' },
    { id: 'c2', name: 'Class 2', parentId: 'm1' },
    { id: 'c3', name: 'Class 3', parentId: 'm2' },
  ],
  divisions: [
    { id: 'd1', name: 'A', parentId: 'c1' },
    { id: 'd2', name: 'A', parentId: 'c2' },
    { id: 'd3', name: 'B', parentId: 'c3' },
  ],
};

describe('Student List academic and bulk scope', () => {
  it('uses one available board and its medium instead of an all-scope option', () => {
    expect(directoryScope(new URLSearchParams(), options)).toEqual({
      board: 'b1',
      medium: 'm1',
      classes: [],
      divisions: [],
      ready: true,
    });
  });

  it('preserves multiple valid classes and divisions without expanding to other boards', () => {
    const scope = directoryScope(
      new URLSearchParams('board=b1&medium=m1&class=c1,c2,c1,c3&division=d1,d2,d3'),
      options
    );
    expect(scope.classes).toEqual(['c1', 'c2']);
    expect(scope.divisions).toEqual(['d1', 'd2']);
    expect(directoryBulkScopeReady(scope, 'Active')).toBe(false);
  });

  it('enables bulk only for exactly one valid class/division in the Active population', () => {
    const scope = directoryScope(
      new URLSearchParams('board=b1&medium=m1&class=c1&division=d1'),
      options
    );
    expect(scope.divisions).toEqual(['d1']);
    expect(directoryBulkScopeReady(scope, 'Active')).toBe(true);
    expect(directoryBulkScopeReady(scope, 'Former')).toBe(false);
    expect(directoryBulkScopeReady({ ...scope, divisions: [] }, 'Active')).toBe(false);
    expect(directoryBulkScopeReady({ ...scope, classes: ['c1', 'c2'] }, 'Active')).toBe(false);
    expect(directoryBulkScopeReady({ ...scope, divisions: ['d1', 'd2'] }, 'Active')).toBe(false);
  });

  it('does not enable queries or bulk while academic options are unavailable', () => {
    const scope = directoryScope(new URLSearchParams('board=b1&medium=m1&class=c1&division=d1'));
    expect(scope.ready).toBe(false);
    expect(directoryBulkScopeReady(scope, 'Active')).toBe(false);
  });

  it('discards stale children when the selected board changes', () => {
    const scope = directoryScope(
      new URLSearchParams('board=b2&medium=m1&class=c1&division=d1'),
      options
    );
    expect(scope).toEqual({ board: 'b2', medium: 'm2', classes: [], divisions: [], ready: false });
  });

  it('fails closed for invalid or mixed stale class/division IDs instead of expanding the population', () => {
    [
      'class=missing',
      'class=c1,missing&division=d1',
      'class=c1&division=d1,d2',
      'board=missing',
    ].forEach((query) => {
      const scope = directoryScope(new URLSearchParams(query), options);
      expect(scope.ready).toBe(false);
      expect(directoryBulkScopeReady(scope, 'Active')).toBe(false);
    });
  });
});
