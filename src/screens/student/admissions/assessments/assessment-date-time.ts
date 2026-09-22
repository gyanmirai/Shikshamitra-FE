const TIME_ZONE_SUFFIX = /(?:Z|[+-]\d{2}:\d{2})$/i;

export function normalizeAssessmentDateTime(value: string) {
  const normalized = value.trim();
  return TIME_ZONE_SUFFIX.test(normalized) ? normalized : `${normalized}Z`;
}

export function assessmentDateTimeTimestamp(value: string) {
  return Date.parse(normalizeAssessmentDateTime(value));
}
