import dayjs from 'dayjs';

import type { IEventAnnouncement } from '../type';

const parseClockTime = (value?: any) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value.isValid() ? value : null;

  const parsed = dayjs(`2000-01-01T${value}`);
  return parsed.isValid() ? parsed : null;
};

const getEventMode = (initialValues: IEventAnnouncement | null) => {
  if (typeof initialValues?.eventMode === 'string' && initialValues.eventMode) {
    return initialValues.eventMode;
  }

  if (initialValues?.mode === 0 || initialValues?.mode === '0') {
    return 'online';
  }

  return 'offline';
};

const toFileData = (value?: any) => {
  if (!value) return null;
  if (value instanceof File) return value;
  if (typeof value === 'object') return value;

  return {
    name: value.split('/').pop() || value,
    url: value,
  };
};

export const getEventInitialValues = (
  initialValues: IEventAnnouncement | null,
  currentYear: any
) => ({
  id: initialValues?.id || '',
  title: initialValues?.title || '',
  description: initialValues?.description || '',
  audience: initialValues?.audienceIds || [],
  duration: initialValues?.duration ?? 0,
  startDate: initialValues?.startDate
    ? dayjs(initialValues?.startDate)
    : dayjs(`${currentYear?.startDate}`),
  endDate: initialValues?.endDate ? dayjs(initialValues?.endDate) : null,
  createdBy: initialValues?.createdBy || '',
  createdOn: initialValues?.createdOn ? dayjs(initialValues?.createdOn) : null,
  status: initialValues?.status || 0,
  type: initialValues?.eventTypeId || '',
  typeName: initialValues?.typeName || initialValues?.eventType?.name || '',
  attachment: toFileData(initialValues?.attachment || initialValues?.poster),
  link: initialValues?.link || '',
  active: initialValues?.active ?? 1,
  eventMode: getEventMode(initialValues),
  onlineLink: initialValues?.onlineLink || '',
  venue: initialValues?.venue || '',
  recurrenceSummary: initialValues?.recurrenceSummary || '',

  // Recurring
  isRecurring: initialValues?.isRecurring || false,
  repeatFrequency: initialValues?.repeatFrequency || '',
  meetingDate: initialValues?.meetingDate ? dayjs(initialValues.meetingDate) : dayjs(),
  startTime: parseClockTime(initialValues?.startTime),
  endTime: parseClockTime(initialValues?.endTime),
  repeatUntil: initialValues?.repeatUntil ? dayjs(initialValues.repeatUntil) : null,
  day: initialValues?.day || '',

  // Custom recurrence
  customInterval: initialValues?.customInterval || '', // 'days' | 'weeks' | 'months'
  customIntervalCount: initialValues?.customIntervalCount ?? 1,
  customDays: initialValues?.customDays || [],

  // Monthly-specific (Teams-like) options
  monthlyOption: initialValues?.monthlyOption || 'onDay', // 'onDay' | 'onThe'
  onDay:
    initialValues?.onDay ??
    (initialValues?.meetingDate ? dayjs(initialValues.meetingDate).date() : dayjs().date()),
  onTheWeek: initialValues?.onTheWeek || 'First', // First/Second/Third/Fourth/Last
  onTheDay: initialValues?.onTheDay || 'Monday',
});
