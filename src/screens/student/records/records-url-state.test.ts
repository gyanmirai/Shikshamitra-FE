import { it, expect, describe } from 'vitest';

import { recordsQueryUrl, positivePageValue } from './records-url-state';

describe('Records URL state', () => {
  it('retains unrelated context and clears cascading filter keys', () => {
    expect(
      recordsQueryUrl(
        '/student/records/directory',
        'population=Former&board=A&class=B&search=Riya',
        { board: 'C', class: undefined, page: 0 }
      )
    ).toBe('/student/records/directory?population=Former&board=C&search=Riya&page=0');
  });
  it('rejects negative, malformed, and over-limit paging values', () => {
    expect(positivePageValue('-1', 0, 100)).toBe(0);
    expect(positivePageValue('NaN', 25, 100)).toBe(25);
    expect(positivePageValue('500', 25, 100)).toBe(25);
    expect(positivePageValue('50', 25, 100)).toBe(50);
  });
});
