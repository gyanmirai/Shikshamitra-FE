import dayjs from 'dayjs';

import type { IMeeting } from './type';

const getMeetingInitialValues = (initialValues: IMeeting) => ({
  title: initialValues?.title || '',
  status: initialValues?.status || '',
  audience: initialValues?.audience || [],
  organization: initialValues?.organization || [],
  className: initialValues?.className || [],
  division: initialValues?.division || [],
  students: initialValues?.students || [],
  meetingDate: initialValues?.meetingDate ? dayjs(initialValues?.meetingDate) : dayjs(),
  meetingTime: initialValues?.meetingTime ? dayjs(initialValues?.meetingTime) : null,
  meetingAgenda: initialValues?.meetingAgenda || '',
  link: initialValues?.link || '',
  meetingType: initialValues?.meetingType || '',
  classRoom: initialValues?.classRoom || '',
  isRecurring: initialValues?.isRecurring || false,
  day: initialValues?.day || '',
  repeatFrequency: initialValues?.repeatFrequency || '',
  repeatUntil: initialValues?.repeatUntil ? dayjs(initialValues?.repeatUntil) : null,
});
