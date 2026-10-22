import { describe, expect, it } from 'vitest';

import { getCloneAcademicYears } from './cloneAcademicYears';

const years = [
  { id: '2025', name: '2025-2026' },
  { id: '2027', name: '2027-2028' },
  { id: '2026', name: '2026-2027' },
];

describe('payment-term clone academic years', () => {
  it('handles the empty global academic-year state before a year is selected', () => {
    const result = getCloneAcademicYears(years, {});
    expect(result.previousYear).toBeUndefined();
    expect(result.sources.map((year) => year.id)).toEqual(['2027', '2026', '2025']);
  });

  it('excludes a target with only an id without assuming its previous year', () => {
    const result = getCloneAcademicYears(years, { id: '2027' });
    expect(result.previousYear).toBeUndefined();
    expect(result.sources.map((year) => year.id)).toEqual(['2026', '2025']);
  });

  it('selects the immediately previous year regardless of input order and excludes the target', () => {
    const result = getCloneAcademicYears(years, years[1]);
    expect(result.previousYear?.id).toBe('2026');
    expect(result.sources.map((year) => year.id)).toEqual(['2026', '2025']);
  });

  it('keeps other years selectable without inventing a previous year for the earliest target', () => {
    const result = getCloneAcademicYears(years, years[0]);
    expect(result.previousYear).toBeUndefined();
    expect(result.sources.map((year) => year.id)).toEqual(['2027', '2026']);
  });

  it('uses academic start dates when names do not contain a year and handles no source years', () => {
    const target = { id: 'current', name: 'Current', startDate: '2027-06-01' };
    const previous = { id: 'previous', name: 'Previous', startDate: '2026-06-01' };
    expect(getCloneAcademicYears([target, previous], target).previousYear).toEqual(previous);
    expect(getCloneAcademicYears([target], target).sources).toEqual([]);
  });
});
