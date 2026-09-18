import { it, expect, describe } from 'vitest';

import {
  readRepeatableValues,
  writeRepeatableValue,
  removeRepeatableEntry,
  getRepeatableEntryCount,
} from './form-repeatable-values';

describe('repeatable admission form values', () => {
  it('updates one entry without losing the others', () => {
    expect(writeRepeatableValue('["A","B"]', 1, 'Changed')).toBe('["A","Changed"]');
  });

  it('removes the matching entry from a field array', () => {
    expect(removeRepeatableEntry('["A","B","C"]', 1)).toBe('["A","C"]');
  });

  it('uses the longest field or configured minimum for the visible entry count', () => {
    expect(getRepeatableEntryCount(['["A","B"]', '["A"]'], 1)).toBe(2);
    expect(getRepeatableEntryCount([], 3)).toBe(3);
  });

  it('treats invalid legacy values as an empty list', () => {
    expect(readRepeatableValues('legacy')).toEqual([]);
  });
});
