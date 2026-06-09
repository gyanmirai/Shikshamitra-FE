import type { Dayjs } from 'dayjs';

export const isValidShiftTimeRange = (startTime?: Dayjs | null, endTime?: Dayjs | null) =>
  Boolean(startTime && endTime && endTime.isAfter(startTime));
