import type { AcademicYear } from 'src/types/school';

import dayjs from 'dayjs';

import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';

const institutionDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Kolkata' });

export const getAdmissionCycleToday = () => institutionDate.format(new Date());

export const isAdmissionCycleDate = (value: string) =>
  dayjs(value).isValid() && dayjs(value).format('YYYY-MM-DD') === value;

export function getCycleDateError(value: string, minimumDate: string, existingDate?: string) {
  if (!isAdmissionCycleDate(value)) return 'Enter a valid date.';
  if (value < minimumDate && value !== existingDate?.slice(0, 10)) {
    return `Choose a date on or after ${dayjs(minimumDate).format(ADMISSION_DATE_FORMAT)}.`;
  }
  return undefined;
}

export function getMinimumClosingDate(openingDate: string, minimumDate?: string) {
  return isAdmissionCycleDate(openingDate) && (!minimumDate || openingDate > minimumDate)
    ? openingDate
    : minimumDate;
}

export function getAdmissionCycleMinimumDate(
  academicYears: AcademicYear[],
  academicYearId: string
) {
  // Institute Setup dates are civil dates; retain their year across timezone offsets.
  const startDate = academicYears
    .find((year) => year.id === academicYearId)
    ?.startDate?.slice(0, 10);
  if (!startDate) return undefined;
  const parsed = dayjs(startDate);
  return parsed.isValid() && parsed.format('YYYY-MM-DD') === startDate
    ? parsed.startOf('year').format('YYYY-MM-DD')
    : undefined;
}
