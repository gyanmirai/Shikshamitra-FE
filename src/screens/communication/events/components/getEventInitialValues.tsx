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
  importance_level: initialValues?.importance_level || '',
  link: initialValues?.link || '',
  active: initialValues?.active ?? 1,
  eventMode: initialValues?.eventMode || 'offline',
  onlineLink: initialValues?.onlineLink || '',
  venue: initialValues?.venue || '',

  isRecurring: initialValues?.isRecurring || false,
  repeatFrequency: initialValues?.repeatFrequency || '',
  meetingDate: initialValues?.meetingDate ? dayjs(initialValues.meetingDate) : dayjs(),
  meetingTime: initialValues?.meetingTime ? dayjs(initialValues.meetingTime) : null,
  repeatUntil: initialValues?.repeatUntil ? dayjs(initialValues.repeatUntil) : null,
  day: initialValues?.day || '',
});
