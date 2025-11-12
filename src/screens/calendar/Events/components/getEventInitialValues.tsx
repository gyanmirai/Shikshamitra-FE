import dayjs from 'dayjs';

import type { IEventAnnouncement } from '../type';

export const getEventInitialValues = (initialValues: IEventAnnouncement | null) => ({
  id: initialValues?.id || '',
  title: initialValues?.title || '',
  description: initialValues?.description || '',
  audience: initialValues?.audience || [],
  organizations: initialValues?.organizations || [],
  classes: initialValues?.classes || [],
  duration: initialValues?.duration ?? 0,
  divisions: initialValues?.divisions || [],
  startDate: initialValues?.startDate ? dayjs(initialValues?.startDate) : dayjs().add(1, 'hours'),
  endDate: initialValues?.endDate ? dayjs(initialValues?.endDate) : null,
  createdBy: initialValues?.createdBy || '',
  createdOn: initialValues?.createdOn ? dayjs(initialValues?.createdOn) : null,
  status: initialValues?.status || 0,
  type: initialValues?.type || '',
  attachment: initialValues?.attachment || null,
  link: initialValues?.link || '',
  active: initialValues?.active ?? 1,
  eventMode: initialValues?.eventMode || 'offline',
  onlineLink: initialValues?.onlineLink || '',
  venue: initialValues?.venue || '',
  recurrenceSummary: initialValues?.recurrenceSummary || '',

  // Recurring
  isRecurring: initialValues?.isRecurring || false,
  repeatFrequency: initialValues?.repeatFrequency || '',
  meetingDate: initialValues?.meetingDate ? dayjs(initialValues.meetingDate) : dayjs(),
  startTime: initialValues?.startTime ? dayjs(initialValues.startTime) : null,
  endTime: initialValues?.endTime ? dayjs(initialValues.endTime) : null,
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
