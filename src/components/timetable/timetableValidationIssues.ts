export interface TimetableValidationIssue {
  title: string;
  description: string;
  severity?: 'error' | 'warning' | 'info';
  details?: Record<string, string>;
}

type ApiErrorLike = {
  data?: {
    error?: {
      message?: string;
      details?: string;
      data?: Record<string, unknown>;
    };
    message?: string;
  };
  error?: string;
};

const toTitleCase = (value?: string) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const getValue = (source: Record<string, unknown>, ...keys: string[]) => {
  const matchedKey = keys.find((key) => source[key] !== undefined && source[key] !== null);
  return matchedKey ? String(source[matchedKey]) : '';
};

const tryParseConflictDetails = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => !!item);
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is Record<string, unknown> => !!item)
      : [];
  } catch {
    return [];
  }
};

const formatConflictIssue = (conflict: Record<string, unknown>): TimetableValidationIssue => {
  const type = getValue(conflict, 'type', 'Type').toLowerCase();
  const resourceLabel = type === 'room' ? 'Room' : 'Teacher';
  const resourceName =
    getValue(conflict, 'resourceName', 'ResourceName') ||
    getValue(conflict, 'teacherName', 'TeacherName') ||
    getValue(conflict, 'roomName', 'RoomName') ||
    `${resourceLabel.toLowerCase()} already selected`;
  const day = toTitleCase(getValue(conflict, 'day', 'Day'));
  const startTime = getValue(conflict, 'startTime', 'StartTime');
  const endTime = getValue(conflict, 'endTime', 'EndTime');
  const timeRange = [startTime, endTime].filter(Boolean).join(' - ');
  const standardName = getValue(conflict, 'conflictingStandardName', 'ConflictingStandardName');
  const divisionName = getValue(conflict, 'conflictingDivisionName', 'ConflictingDivisionName');
  const subjectName = getValue(conflict, 'conflictingSubjectName', 'ConflictingSubjectName');
  const classText = [standardName, divisionName && `Division ${divisionName}`]
    .filter(Boolean)
    .join(' ');

  return {
    title: `${resourceLabel} conflict: ${resourceName}`,
    description: [
      `${resourceName} is already assigned`,
      classText ? `to ${classText}` : 'to another class',
      subjectName ? `for ${subjectName}` : '',
      day || timeRange ? `during ${[day, timeRange].filter(Boolean).join(' ')}` : '',
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+\./g, '.'),
    severity: 'error',
    details: {
      ...(timeRange ? { Time: timeRange } : {}),
      ...(day ? { Day: day } : {}),
      ...(classText ? { Class: classText } : {}),
      ...(subjectName ? { Subject: subjectName } : {}),
      [resourceLabel]: resourceName,
    },
  };
};

export const extractTimetableApiIssues = (
  error: unknown,
  fallbackTitle = 'Server validation failed'
): TimetableValidationIssue[] => {
  const apiError = error as any;
  const innerError = apiError?.data?.error ?? apiError?.error ?? apiError;
  const customData = innerError?.data ?? {};

  const conflictDetails = tryParseConflictDetails(
    customData.ConflictDetails ??
      customData.conflictDetails ??
      customData.conflicts ??
      apiError?.data?.ConflictDetails ??
      apiError?.data?.conflictDetails ??
      apiError?.data?.conflicts
  );

  if (conflictDetails.length > 0) {
    return conflictDetails.map(formatConflictIssue);
  }

  const message =
    (typeof customData.message === 'string' && customData.message) ||
    (typeof customData.Message === 'string' && customData.Message) ||
    innerError?.message ||
    innerError?.details ||
    apiError?.data?.message ||
    apiError?.message ||
    (typeof apiError?.error === 'string' && apiError?.error) ||
    'Please review timetable conflicts and try again.';

  return [
    {
      title: fallbackTitle,
      description: message,
      severity: 'error',
    },
  ];
};

