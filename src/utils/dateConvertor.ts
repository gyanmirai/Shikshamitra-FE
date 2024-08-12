import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);
dayjs.extend(utc);

export const dateFormat = 'DD/MM/YYYY HH:mm:ss';

export const dateConvertor = (date: string) => {
  const userTimeZone = dayjs.tz.guess();

  return dayjs(date, dateFormat).tz(userTimeZone).format();
};
