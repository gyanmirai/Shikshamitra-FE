import { it, expect, describe } from 'vitest';

import {
  canDeleteCriterion,
  addCriterionFromChip,
} from './criterion-builder-utils';

type Criterion = { id: string; title: string };

const criteria: Criterion[] = [
  { id: 'one', title: 'Accuracy' },
  { id: 'two', title: 'Completeness' },
  { id: 'three', title: 'Creativity' },
];

describe('rubric criterion builder utilities', () => {
  it('adds quick-add chips without duplicates and fills the first empty row', () => {
    const withEmptyRow = [...criteria, { id: 'empty', title: '' }];
    const filled = addCriterionFromChip(withEmptyRow, 'Research Quality', (title) => ({
      id: 'new',
      title,
    }));
    expect(filled).toEqual([...criteria, { id: 'empty', title: 'Research Quality' }]);

    const duplicate = addCriterionFromChip(criteria, 'accuracy', (title) => ({ id: 'new', title }));
    expect(duplicate).toBe(criteria);
  });

  it('prevents deleting the final criterion', () => {
    expect(canDeleteCriterion(1)).toBe(false);
    expect(canDeleteCriterion(2)).toBe(true);
  });
});
