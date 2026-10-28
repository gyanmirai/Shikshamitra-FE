import { toDateOnly, parseDateOnly, formatDateOnly } from 'src/utils/date-only';

function calendarDate(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return null;
  const date = parseDateOnly(value);
  return date?.format('YYYY-MM-DD') === toDateOnly(value) ? date : null;
}

/** Calendar age at the offering's academic year start, independent of today's date/timezone. */
export function getAdmissionInquiryAge(
  birthDate?: string | null,
  academicYearStartDate?: string | null,
  minimumAgeYears?: number | null
) {
  const birth = calendarDate(birthDate);
  const start = calendarDate(academicYearStartDate);
  if (!birth || !start) return null;

  const dateLabel = formatDateOnly(start);
  const minimum =
    typeof minimumAgeYears === 'number' && Number.isFinite(minimumAgeYears) && minimumAgeYears > 0
      ? minimumAgeYears
      : null;
  if (birth.isAfter(start, 'day')) {
    return {
      compactHelpText: 'Not born at academic year start.',
      helpText: `Not born at academic year start (${dateLabel}).`,
      warning: minimum
        ? `Date of birth is after academic year start (${dateLabel}). Minimum age is ${minimum} years. You can still save this inquiry.`
        : '',
    };
  }

  let totalMonths = (start.year() - birth.year()) * 12 + start.month() - birth.month();
  if (birth.add(totalMonths, 'month').isAfter(start, 'day')) totalMonths -= 1;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const age = `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'}`;
  const warning =
    minimum && totalMonths < minimum * 12
      ? `Student's age at academic year start (${dateLabel}) is ${age}, below the minimum age of ${minimum} years for this class. You can still save this inquiry.`
      : '';
  return {
    compactHelpText: `Age: ${years}y ${months}m${minimum ? ` · Minimum: ${minimum}y` : ''}`,
    helpText: `Age at academic year start (${dateLabel}): ${age}.${warning ? ` Minimum age: ${minimum} years. This is a warning only.` : ''}`,
    warning,
  };
}
