import { it, expect, describe } from 'vitest';

import { getSubjectMasterStatusLabel } from './subjectMasterStatus';

describe('getSubjectMasterStatusLabel', () => {
  it.each([
    [0, 'Active'],
    [1, 'Inactive'],
    [2, 'Archived'],
    ['0', 'Active'],
    ['1', 'Inactive'],
    ['2', 'Archived'],
    ['Active', 'Active'],
    ['Inactive', 'Inactive'],
    ['Archived', 'Archived'],
  ])('maps %s to %s', (status, expected) => {
    expect(getSubjectMasterStatusLabel(status)).toBe(expected);
  });
});
