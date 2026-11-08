export type AttendanceDraft = {
  status: string;
  inTime: string;
  outTime: string;
  remarks: string;
  reason: string;
};

export type AttendanceDraftErrors = {
  inTime?: string;
  outTime?: string;
  remarks?: string;
  reason?: string;
};

type AttendanceCaptureRow = {
  captureMode?: 'manual_status' | 'manual_with_time' | 'integrated';
  canEdit: boolean;
};

export const usesAttendanceAdjustmentTimes = (rows: AttendanceCaptureRow[]) =>
  rows.some((row) => row.canEdit && row.captureMode !== 'manual_status');

export const getAttendanceAdjustmentTimes = (
  draft: AttendanceDraft,
  rows: AttendanceCaptureRow[]
) =>
  usesAttendanceAdjustmentTimes(rows)
    ? { inTime: draft.inTime, outTime: draft.outTime }
    : { inTime: '', outTime: '' };

const isClockTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const validateAttendanceDraft = (
  draft: AttendanceDraft,
  rows: AttendanceCaptureRow[]
): AttendanceDraftErrors => {
  const errors: AttendanceDraftErrors = {};
  if (!usesAttendanceAdjustmentTimes(rows)) return errors;

  const inTime = draft.inTime.trim();
  const outTime = draft.outTime.trim();
  const requiresTime = draft.status === 'Present' || draft.status === 'HalfDayLeave';

  if (requiresTime) {
    if (!inTime) errors.inTime = 'In time is required.';
    if (!outTime) errors.outTime = 'Out time is required.';
  }

  if ((inTime && !outTime) || (!inTime && outTime)) {
    if (!inTime) errors.inTime = 'In time is required when out time is provided.';
    if (!outTime) errors.outTime = 'Out time is required when in time is provided.';
  }

  if (inTime && outTime) {
    if (!isClockTime(inTime)) errors.inTime = 'Invalid in time.';
    if (!isClockTime(outTime)) errors.outTime = 'Invalid out time.';
    if (isClockTime(inTime) && isClockTime(outTime) && outTime <= inTime) {
      errors.outTime = 'Out time must be after in time.';
    }
  }
  return errors;
};

type AttendanceAdjustmentResult = {
  updatedCount?: number;
  skippedCount?: number;
  rows?: {
    attendanceId?: string | null;
    employeeId?: string | null;
    attendanceDate?: string | null;
    updated?: boolean;
    reason?: string | null;
  }[];
};

// An HTTP 200 can contain a skipped row after a concurrent day/payroll lock.
export const getSingleAttendanceAdjustmentFailure = (
  result?: AttendanceAdjustmentResult | null
): string | null => {
  const skipped = result?.rows?.find((row) => row.updated === false);
  if (result?.updatedCount === 1 && result.skippedCount === 0 && !skipped) return null;
  return (
    skipped?.reason?.trim() ||
    'Attendance was not adjusted. Refresh the register and check whether the day is still editable.'
  );
};

type AttendanceAdjustmentTarget = {
  attendanceId?: string | null;
  employeeId: string;
  attendanceDate: string;
  employeeName?: string;
  employeeCode?: string;
};

export const reconcileBulkAttendanceAdjustment = <TRow extends AttendanceAdjustmentTarget>(
  submittedRows: TRow[],
  result?: AttendanceAdjustmentResult | null
) => {
  const outcomes = submittedRows.map((target) => {
    const matches = (result?.rows ?? []).filter((row) =>
      target.attendanceId
        ? row.attendanceId === target.attendanceId
        : row.employeeId === target.employeeId && row.attendanceDate === target.attendanceDate
    );
    const response = matches.length === 1 ? matches[0] : undefined;
    return { target, response };
  });
  const updatedCount = outcomes.filter(({ response }) => response?.updated === true).length;
  const skippedCount = outcomes.filter(({ response }) => response?.updated === false).length;
  const pending = outcomes.filter(({ response }) => response?.updated !== true);
  const retryBlocked =
    submittedRows.length === 0 ||
    updatedCount + skippedCount !== submittedRows.length ||
    result?.rows?.length !== submittedRows.length ||
    result?.updatedCount !== updatedCount ||
    result?.skippedCount !== skippedCount;
  const complete = !retryBlocked && pending.length === 0;
  const details = pending.map(({ target, response }) => {
    const staff = target.employeeName || target.employeeCode || 'Staff';
    const reason =
      response?.updated === false
        ? response.reason?.trim() || 'Not adjusted. Check whether the day is still editable.'
        : "The server did not confirm this row's outcome.";
    return `${staff} (${target.attendanceDate}): ${reason}`;
  });
  const summary = `Confirmed ${updatedCount} of ${submittedRows.length} update(s); ${skippedCount} skipped.`;
  return {
    complete,
    updatedCount,
    pendingRows: pending.map(({ target }) => target),
    retryBlocked,
    message: complete
      ? null
      : [
          summary,
          ...details,
          retryBlocked
            ? 'The response is incomplete or inconsistent. Close and refresh the register before submitting again to avoid repeating successful updates.'
            : 'Your draft is retained. Retry only the remaining days after resolving the reasons above.',
        ].join('\n'),
  };
};
