import type { PayslipCorrectionAttendance } from 'src/redux/hr/payslip-api';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export type CorrectionAttendanceDraft = Omit<PayslipCorrectionAttendance, 'timeIn' | 'timeOut'> & {
  timeIn: string;
  timeOut: string;
};

const clock = (value: string | null) => value ? dayjs(value).utc().format('HH:mm') : '';

export function correctionAttendanceDraft(records: PayslipCorrectionAttendance[]): CorrectionAttendanceDraft[] {
  return records.map((record) => ({ ...record, timeIn: clock(record.timeIn), timeOut: clock(record.timeOut) }));
}

export function correctionAttendancePayload(drafts: CorrectionAttendanceDraft[], recorded: PayslipCorrectionAttendance[]): PayslipCorrectionAttendance[] {
  const source = new Map(recorded.map((record) => [record.date, record]));
  return drafts.map((draft) => {
    const original = source.get(draft.date);
    // Unedited punches retain their exact offset, seconds and fractional precision.
    // Edited clock values use attendance's existing same-day, offset-zero contract.
    const timestamp = (value: string, previous: string | null | undefined) =>
      value === clock(previous ?? null) ? previous ?? null : value ? `${draft.date}T${value}:00Z` : null;
    return { date: draft.date, status: draft.status,
      timeIn: timestamp(draft.timeIn, original?.timeIn), timeOut: timestamp(draft.timeOut, original?.timeOut) };
  });
}
