import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

export const formatAttendanceDashboardDate = (value: Dayjs | null | undefined) =>
  value?.format('YYYY-MM-DD');

export const buildAttendanceSummaryQuery = (selectedMonth: Dayjs | null | undefined) => {
  const month = selectedMonth ?? dayjs();

  return {
    startDate: month.startOf('month').format('YYYY-MM-DD'),
    endDate: month.endOf('month').format('YYYY-MM-DD'),
  };
};

export const buildAttendanceHistoryQuery = ({
  studentId,
  startDate,
  endDate,
  skipCount,
  maxResultCount,
  sorting,
}: {
  studentId: string;
  startDate: Dayjs | null | undefined;
  endDate: Dayjs | null | undefined;
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
}) => ({
  studentId,
  startDate: formatAttendanceDashboardDate(startDate),
  endDate: formatAttendanceDashboardDate(endDate),
  skipCount,
  maxResultCount,
  sorting,
});
