import { it, expect, describe } from 'vitest';

import {
  buildInquirySourceOptions,
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

  it('keeps existing inactive selected source visible without duplicating active options', () => {
    const activeItems = [{ id: 'active-source', preferenceName: 'Walk In', isActive: true }];

    expect(
      buildInquirySourceOptions(activeItems, 'legacy-source', 'Old Campaign').map((item) => ({
        id: item.id,
        preferenceName: item.preferenceName,
        isActive: item.isActive,
      }))
    ).toEqual([
      { id: 'active-source', preferenceName: 'Walk In', isActive: true },
      { id: 'legacy-source', preferenceName: 'Old Campaign (Inactive)', isActive: false },
    ]);

    expect(buildInquirySourceOptions(activeItems, 'active-source', 'Walk In')).toBe(activeItems);
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
        ['known-source', 'legacy-source-id', 'legacy-source-id']
      ).map((item) => ({
        id: item.id,
        preferenceName: item.preferenceName,
        isActive: item.isActive,
      }))
    ).toEqual([
      { id: 'known-source', preferenceName: 'Walk In', isActive: true },
      {
        id: 'legacy-source-id',
        preferenceName: 'Unknown source (legacy-s)',
        isActive: false,
      },
    ]);
  });
});
