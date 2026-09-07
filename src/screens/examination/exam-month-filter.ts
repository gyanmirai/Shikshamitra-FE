import dayjs, { type Dayjs } from 'dayjs';

export type AcademicYearForMonthFilter = {
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type ExamMonthOption = {
  value: string;
  label: string;
  startDate: string;
  endDate: string;
};

const parseAcademicYearName = (name?: string | null): [Dayjs, Dayjs] | null => {
  const years = name?.match(/\d{2,4}/g);
  if (!years?.length) return null;

  const startYear = Number(years[0]);
  const rawEndYear = years[1] ? Number(years[1]) : startYear + 1;
  const endYear =
    years[1]?.length === 2 ? Math.floor(startYear / 100) * 100 + rawEndYear : rawEndYear;

  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || endYear < startYear) {
    return null;
  }

  return [dayjs(`${startYear}-04-01`), dayjs(`${endYear}-03-31`)];
};

const getAcademicYearBounds = (academicYear?: AcademicYearForMonthFilter | null) => {
  const configuredStart = academicYear?.startDate ? dayjs(academicYear.startDate) : null;
  const configuredEnd = academicYear?.endDate ? dayjs(academicYear.endDate) : null;

  if (
    configuredStart?.isValid() &&
    configuredEnd?.isValid() &&
    !configuredEnd.isBefore(configuredStart)
  ) {
    return [configuredStart, configuredEnd] as const;
  }

  return parseAcademicYearName(academicYear?.name);
};

export const buildExamMonthOptions = (
  academicYear?: AcademicYearForMonthFilter | null
): ExamMonthOption[] => {
  const bounds = getAcademicYearBounds(academicYear);
  if (!bounds) return [];

  const [academicYearStart, academicYearEnd] = bounds;
  const options: ExamMonthOption[] = [];
  let month = academicYearStart.startOf('month');
  const finalMonth = academicYearEnd.startOf('month');

  while (!month.isAfter(finalMonth, 'month')) {
    const rangeStart = month.isSame(academicYearStart, 'month')
      ? academicYearStart.startOf('day')
      : month.startOf('month');
    const rangeEnd = month.isSame(academicYearEnd, 'month')
      ? academicYearEnd.endOf('day')
      : month.endOf('month');

    options.push({
      value: month.format('YYYY-MM'),
      label: month.format('MMMM YYYY'),
      startDate: rangeStart.format('YYYY-MM-DDTHH:mm:ss.SSS'),
      endDate: rangeEnd.format('YYYY-MM-DDTHH:mm:ss.SSS'),
    });

    month = month.add(1, 'month');
  }

  return options;
};

export const getDefaultExamMonth = (options: ExamMonthOption[], today: Dayjs = dayjs()): string => {
  const currentMonth = today.format('YYYY-MM');
  return options.some((option) => option.value === currentMonth)
    ? currentMonth
    : (options[0]?.value ?? '');
};

export const getExamMonthRange = (options: ExamMonthOption[], selectedMonth: string) =>
  options.find((option) => option.value === selectedMonth);
