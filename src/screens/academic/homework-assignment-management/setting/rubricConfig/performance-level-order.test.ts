import { it, expect, describe } from 'vitest';

import { levelNumberAt, reorderPerformanceLevels } from './performance-level-order';

import type { RubricPerformanceLevelFormValue } from './types';

const levels: RubricPerformanceLevelFormValue[] = [
  { id: 'excellent', label: 'Excellent', score: '4', studentLabel: 'Excellent', description: '' },
  { id: 'good', label: 'Good', score: '3', studentLabel: 'Good', description: '' },
  { id: 'needs-work', label: 'Needs work', score: '1', studentLabel: 'Needs work', description: '' },
];

describe('performance level ordering', () => {
  it('moves rows, derives descending levels, and preserves each score', () => {
    const reordered = reorderPerformanceLevels(levels, 'needs-work', 'excellent');

    expect(reordered.map((level) => level.id)).toEqual(['needs-work', 'excellent', 'good']);
    expect(reordered.map((_level, index) => levelNumberAt(index, reordered.length))).toEqual([
      3, 2, 1,
    ]);
    expect(reordered.map((level) => level.score)).toEqual(['1', '4', '3']);
  });

  it('renumbers after append and delete without changing the remaining rows', () => {
    const appended = [...levels, { ...levels[0], id: 'new', label: '', score: '' }];
    expect(appended.map((_level, index) => levelNumberAt(index, appended.length))).toEqual([
      4, 3, 2, 1,
    ]);

    const remaining = appended.filter((level) => level.id !== 'good');
    expect(remaining.map((_level, index) => levelNumberAt(index, remaining.length))).toEqual([
      3, 2, 1,
    ]);
  });
});
