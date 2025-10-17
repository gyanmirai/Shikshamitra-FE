import dayjs from 'dayjs';

export const getRecurrenceSummary = (values: any): string | undefined => {
  const {
    repeatFrequency,
    customInterval,
    customIntervalCount,
    customDays,
    monthlyOption,
    onDay,
    onTheWeek,
    onTheDay,
    repeatUntil,
    startDate,
    endDate,
    meetingDate,
    meetingTime,
    type,
  } = values;

  const formatDateTime = (date: any, time?: any) =>
    date
      ? dayjs(date).format('DD MMM YYYY') + (time ? ` at ${dayjs(time).format('HH:mm')}` : '')
      : '';

  if (repeatFrequency && repeatUntil) {
    const untilText = `until ${dayjs(repeatUntil).format('DD MMM YYYY')}`;

    // eslint-disable-next-line default-case
    switch (repeatFrequency) {
      case 'Daily':
        return `Occurs every day ${untilText}`;
      case 'Weekly':
        return customDays?.length
          ? `Occurs every ${customDays.join(', ')} ${untilText}`
          : `Occurs weekly ${untilText}`;
      case 'Monthly':
        return monthlyOption === 'onDay'
          ? `Occurs on day ${onDay} of every month ${untilText}`
          : `Occurs on the ${onTheWeek} ${onTheDay} of every month ${untilText}`;
      case 'Custom':
        if (customInterval === 'days')
          return `Occurs every ${customIntervalCount} day(s) ${untilText}`;
        if (customInterval === 'weeks') {
          const daysText = customDays?.length ? ` on ${customDays.join(', ')}` : '';
          return `Occurs every ${customIntervalCount} week(s)${daysText} ${untilText}`;
        }
        if (customInterval === 'months') {
          return monthlyOption === 'onDay'
            ? `Occurs every ${customIntervalCount} month(s) on day ${onDay} ${untilText}`
            : `Occurs every ${customIntervalCount} month(s) on the ${onTheWeek} ${onTheDay} ${untilText}`;
        }
        break;
    }
  } else {
    // Non-recurring event: show single date and time
    if (type === 'meeting' && meetingDate) {
      return `Meeting scheduled on ${formatDateTime(meetingDate, meetingTime)}`;
    }
    if (startDate) {
      return `Event scheduled from ${formatDateTime(startDate)}${endDate ? ` to ${formatDateTime(endDate)}` : ''}`;
    }
  }

  return '';
};
