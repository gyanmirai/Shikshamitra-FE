import type { AcademicYear } from 'src/types/school';

import dayjs from 'dayjs';

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
