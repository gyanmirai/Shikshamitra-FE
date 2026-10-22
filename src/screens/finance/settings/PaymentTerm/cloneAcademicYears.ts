export interface CloneAcademicYear {
  id: string;
  name: string;
  startDate?: string | null;
}

const startYear = (year: Partial<CloneAcademicYear>) => {
  const value = year.startDate?.match(/^\d{4}/)?.[0] ?? year.name?.match(/\d{4}/)?.[0];
  return value ? Number(value) : undefined;
};

/** Keep every other year selectable, preferring the immediately preceding academic year. */
export function getCloneAcademicYears(
  years: CloneAcademicYear[],
  target?: Partial<CloneAcademicYear> | null
) {
  const targetStart = target && startYear(target);
  const sources = years
    .filter((year) => year.id && year.id !== target?.id)
    .sort((left, right) => (startYear(right) ?? 0) - (startYear(left) ?? 0));
  const previousYear = targetStart
    ? sources.find((year) => startYear(year) === targetStart - 1)
    : undefined;
  return { sources, previousYear };
}
