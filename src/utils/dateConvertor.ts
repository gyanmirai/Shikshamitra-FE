import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

export const dateFormat = 'DD/MM/YYYY HH:mm:ss';

export const dateConvertor = (date: string, isParams = false) => {
  const userTimeZone = dayjs.tz.guess();
  return isParams
    ? encodeURIComponent(dayjs(date, dateFormat).tz(userTimeZone).format())
    : dayjs(date, dateFormat).tz(userTimeZone).format();
};

export const datePickerToDateTimeOffset = (value: Dayjs | null | undefined): string | null => {
  if (!value?.isValid()) return null;
  return dateConvertor(value.startOf('day').format(dateFormat));
};
