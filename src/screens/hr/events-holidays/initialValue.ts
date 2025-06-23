import dayjs from 'dayjs';

import type { IEventHoliday } from '.';

export const eventAndHolidayInitialValues = (editData: IEventHoliday | null) => ({
  startDate: editData ? dayjs(editData.startDate) : null,
  endDate: editData ? dayjs(editData.endDate) : null,
  reason: editData?.reason || '',
  isHoliday: editData?.isHoliday ?? false,
  name: editData?.name || '',
  documentSize: editData?.documentSize || 5,
});
