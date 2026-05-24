import { FeeMonth } from 'src/enums/fee-collection-type';

export interface AcademicYearMonth {
  month: number;
  year: number;
}

export interface MonthYearOption {
  label: string;
  value: string;
}

/**
 * Builds month-year options from academic year months API response.
 * First option is always "All".
 * Format: "Month-Year" (e.g., "May-2026")
 */
export const buildAcademicMonthOptions = (
  months: AcademicYearMonth[] | undefined
): MonthYearOption[] => {
  const allOption: MonthYearOption = { label: 'All', value: 'All' };

  if (!months || months.length === 0) return [allOption];

  const options = months.map((item) => ({
    label: `${FeeMonth[item.month]}-${item.year}`,
    value: `${item.month}-${item.year}`,
  }));

  return [allOption, ...options];
};
