import { it, expect, describe } from 'vitest';

import { mergeCategoryTags } from './category-tags';

describe('category pending tags', () => {
  it('includes pending Unicode text when submitting', () => {
    expect(mergeCategoryTags(['fees'], ' शुल्क ')).toEqual(['fees', 'शुल्क']);
  });
  it('deduplicates case/space variants and drops empty drafts', () => {
    expect(mergeCategoryTags(['Fees', ' fees ', 'खर्च'], ' FEES ')).toEqual(['Fees', 'खर्च']);
    expect(mergeCategoryTags(['fees'], ' ')).toEqual(['fees']);
  });
});
