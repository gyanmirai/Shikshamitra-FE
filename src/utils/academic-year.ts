type AcademicYearLike = {
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

const ACADEMIC_YEAR_START_MONTH = 3; // April, zero-based.

const parseLocalDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const getAcademicYearBounds = (accessDate: Date) => {
  const startYear =
    accessDate.getMonth() >= ACADEMIC_YEAR_START_MONTH
      ? accessDate.getFullYear()
      : accessDate.getFullYear() - 1;

  return {
    startYear,
    endYear: startYear + 1,
  };
};

const isYearNameMatch = (
  academicYear: AcademicYearLike,
  expectedStartYear: number,
  expectedEndYear: number
) => {
  const yearParts = academicYear.name?.match(/\d{2,4}/g);
  if (!yearParts?.length) return false;

  const [startPart, endPart] = yearParts;
  const startYear = Number(startPart);
  const endYear = Number(endPart);

  if (startYear !== expectedStartYear) return false;

  if (endPart?.length === 2) {
    return endYear === expectedEndYear % 100;
  }

  return endYear === expectedEndYear;
};

export const findCurrentAcademicYear = <T extends AcademicYearLike>(
  academicYears: T[] | undefined,
  accessDate = new Date()
): T | undefined => {
  if (!academicYears?.length) return undefined;

  const { startYear, endYear } = getAcademicYearBounds(accessDate);
  const accessTime = accessDate.getTime();

  return (
    academicYears.find((academicYear) => {
      const yearStartDate = parseLocalDate(academicYear.startDate);
      const yearEndDate = parseLocalDate(academicYear.endDate);

      return (
        yearStartDate &&
        yearEndDate &&
        yearStartDate.getTime() <= accessTime &&
        accessTime <= yearEndDate.getTime()
      );
    }) ?? academicYears.find((academicYear) => isYearNameMatch(academicYear, startYear, endYear))
  );
};
