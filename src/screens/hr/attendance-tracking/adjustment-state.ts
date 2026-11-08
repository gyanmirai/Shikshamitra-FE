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
  rows?: { updated?: boolean; reason?: string | null }[];
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
