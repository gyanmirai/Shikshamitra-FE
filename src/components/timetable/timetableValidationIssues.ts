export interface TimetableValidationIssue {
  title: string;
  description: string;
  severity?: 'error' | 'warning' | 'info';
  details?: Record<string, string>;
}

type ApiErrorLike = {
  data?: {
    errorCode?: string;
    detail?: string;
    data?: Record<string, unknown>;
    error?: {
      code?: string;
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

const formatDayAndTime = (data: Record<string, unknown>) => {
  const day = toTitleCase(getValue(data, 'Day', 'day'));
  const startTime = getValue(data, 'StartTime', 'startTime');
  const endTime = getValue(data, 'EndTime', 'endTime');
  const timeRange = [startTime, endTime].filter(Boolean).join(' - ');

  return {
    day,
    timeRange,
    details: {
      ...(day ? { Day: day } : {}),
      ...(timeRange ? { Time: timeRange } : {}),
    },
  };
};

const formatKnownTimetableIssue = (
  errorCode: string,
  data: Record<string, unknown>
): TimetableValidationIssue | null => {
  const { day, timeRange, details } = formatDayAndTime(data);
  const slotText = [day, timeRange].filter(Boolean).join(' ');
  const contextualMessage = getValue(data, 'message', 'Message');

  if (
    errorCode === 'Academic:Timetable:RoomConflict' ||
    errorCode === 'Academic:Timetable:030004'
  ) {
    return {
      title: 'Room conflict found',
      description:
        contextualMessage ||
        `The selected room is already assigned to another class${slotText ? ` during ${slotText}` : ' during this time slot'}. Choose another room or change the timetable slot.`,
      severity: 'error',
      details,
    };
  }

  if (
    errorCode === 'Academic:Timetable:TeacherConflict' ||
    errorCode === 'Academic:Timetable:030003'
  ) {
    return {
      title: 'Teacher conflict found',
      description:
        contextualMessage ||
        `The selected teacher is already assigned to another class${slotText ? ` during ${slotText}` : ' during this time slot'}. Choose another teacher or change the timetable slot.`,
      severity: 'error',
      details,
    };
  }

  if (errorCode === 'Academic:Timetable:TeacherRequiredBeforePublish') {
    return {
      title: 'Teacher assignment required',
      description: `A teaching period${slotText ? ` on ${slotText}` : ''} is missing a teacher. Assign teachers for every subject before publishing.`,
      severity: 'error',
      details,
    };
  }

  if (errorCode === 'Academic:Timetable:RoomRequiredBeforePublish') {
    return {
      title: 'Room assignment required',
      description: `A teaching period${slotText ? ` on ${slotText}` : ''} is missing a room. Assign rooms for every subject before publishing.`,
      severity: 'error',
      details,
    };
  }

  return null;
};

export const extractTimetableApiIssues = (
  error: unknown,
  fallbackTitle = 'Server validation failed'
): TimetableValidationIssue[] => {
  const apiError = error as any;
  const problem = apiError?.data && typeof apiError.data === 'object' ? apiError.data : apiError;
  const innerError = problem?.error && typeof problem.error === 'object' ? problem.error : problem;
  const nestedCustomData =
    innerError?.data && typeof innerError.data === 'object'
      ? innerError.data
      : problem?.data && typeof problem.data === 'object'
        ? problem.data
        : null;
  const customData = nestedCustomData ?? innerError ?? problem ?? {};
  const errorCode = problem?.errorCode ?? innerError?.code ?? innerError?.errorCode;

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

  if (typeof errorCode === 'string') {
    const knownIssue = formatKnownTimetableIssue(errorCode, customData);
    if (knownIssue) return [knownIssue];
  }

  const message =
    (typeof customData.message === 'string' && customData.message) ||
    (typeof customData.Message === 'string' && customData.Message) ||
    apiError?.data?.detail ||
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
