import { it, expect, describe } from 'vitest';

import {
  sortInquirySourcesForSelection,
  buildInquirySourceSelectOptions,
  resolveInquirySourceAcademicYearId,
} from './inquiry-source-utils';

describe('Inquiry Source helpers', () => {
  it('uses selected academic year before global current year', () => {
    expect(resolveInquirySourceAcademicYearId('selected-year', 'current-year')).toBe(
      'selected-year'
    );
    expect(resolveInquirySourceAcademicYearId('', 'current-year')).toBe('current-year');
    expect(resolveInquirySourceAcademicYearId(null, null)).toBeUndefined();
  });

  it('sorts inquiry sources for settings selectors by display order and name', () => {
    expect(
      sortInquirySourcesForSelection([
        { id: 'b', preferenceName: 'Website', displayOrder: 20 },
        { id: 'c', preferenceName: 'Campaign' },
        { id: 'a', preferenceName: 'Walk In', displayOrder: 10 },
      ]).map((item) => item.id)
    ).toEqual(['a', 'b', 'c']);
  });

  it('keeps unknown selected source IDs visible in settings selectors', () => {
    expect(
      buildInquirySourceSelectOptions(
        [{ id: 'known-source', preferenceName: 'Walk In', displayOrder: 10, isActive: true }],
        ['known-source', 'unavailable-source-id', 'unavailable-source-id']
      ).map((item) => ({
        id: item.id,
        preferenceName: item.preferenceName,
        isActive: item.isActive,
      }))
    ).toEqual([
      { id: 'known-source', preferenceName: 'Walk In', isActive: true },
      {
        id: 'unavailable-source-id',
        preferenceName: 'Unknown source (unavaila)',
        isActive: false,
      },
    ]);
  });
});
