import { it, expect, describe } from 'vitest';

import { findCurrentAcademicYear } from './academic-year';

const years = [
  { id: '2024', name: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31' },
  { id: '2025', name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31' },
  { id: '2026', name: '2026-2027', startDate: '2026-04-01', endDate: '2027-03-31' },
];

describe('findCurrentAcademicYear', () => {
  it('selects the current year from April through March by date range', () => {
    expect(findCurrentAcademicYear(years, new Date(2026, 2, 31))?.id).toBe('2025');
    expect(findCurrentAcademicYear(years, new Date(2026, 3, 1))?.id).toBe('2026');
  });

  it('falls back to matching common academic year names', () => {
    const yearWithoutDates = [
      { id: '2024', name: '2024-25' },
      { id: '2025', name: '2025-26' },
    ];

    expect(findCurrentAcademicYear(yearWithoutDates, new Date(2026, 0, 15))?.id).toBe('2025');
  });
});
