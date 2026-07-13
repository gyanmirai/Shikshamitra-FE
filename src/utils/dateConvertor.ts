import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);
dayjs.extend(utc);

export const dateFormat = 'DD/MM/YYYY HH:mm:ss';

export const dateConvertor = (date: string, isParams = false) => {
  const userTimeZone = dayjs.tz.guess();
  console.log(userTimeZone, '[][][', date);
  return isParams
    ? encodeURIComponent(dayjs(date, dateFormat).tz(userTimeZone).format())
    : dayjs(date, dateFormat).tz(userTimeZone).format();
};
