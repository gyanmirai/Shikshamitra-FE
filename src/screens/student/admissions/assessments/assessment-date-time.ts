const TIME_ZONE_SUFFIX = /(?:Z|[+-]\d{2}:\d{2})$/i;

export function normalizeAssessmentDateTime(value: string) {
  const normalized = value.trim();
  return TIME_ZONE_SUFFIX.test(normalized) ? normalized : `${normalized}Z`;
}

export function assessmentDateTimeTimestamp(value: string) {
  return Date.parse(normalizeAssessmentDateTime(value));
}

const schoolDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const schoolTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatAssessmentSchedule(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt) return null;
  const start = assessmentDateTimeTimestamp(startsAt);
  const end = endsAt ? assessmentDateTimeTimestamp(endsAt) : undefined;
  if (!Number.isFinite(start) || (end !== undefined && !Number.isFinite(end))) return null;
  return {
    date: schoolDate.format(start),
    time: `${schoolTime.format(start)}${end === undefined ? '' : `–${schoolTime.format(end)}`} IST`,
  };
}
