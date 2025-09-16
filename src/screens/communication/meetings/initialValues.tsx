import dayjs from 'dayjs';

import type { IMeeting } from './type';

export const getInitialMeetingValues = (initialValues?: IMeeting) => ({
  id: initialValues?.id || 0,
  title: initialValues?.title || '',
  status: initialValues?.status || '',
  type: initialValues?.type || '',
  importance_level: initialValues?.importance_level || '',
  description: initialValues?.description || '',
  attachment: initialValues?.attachment || [],
  startDate: initialValues?.startDate ? dayjs(initialValues?.startDate) : dayjs().add(1, 'hours'),
  endDate: initialValues?.endDate ? dayjs(initialValues?.endDate) : null,
  // Audience & Participants
  audience: initialValues?.audience || [],
  organizations: initialValues?.organizations || [],
  classes: initialValues?.classes || [],
  divisions: initialValues?.divisions || [],
  students: initialValues?.students || [],

  // Meeting details
  meetingDate: initialValues?.meetingDate ? dayjs(initialValues.meetingDate) : dayjs(),
  meetingTime: initialValues?.meetingTime ? dayjs(initialValues.meetingTime) : null,
  meetingAgenda: initialValues?.meetingAgenda || '',
  link: initialValues?.link || '',
  meetingType: initialValues?.meetingType || '',
  classRoom: initialValues?.classRoom || '',
  isRecurring: initialValues?.isRecurring || false,
  day: initialValues?.day || '',
  repeatFrequency: initialValues?.repeatFrequency || '',
  mode: initialValues?.mode || '',
  repeatUntil: initialValues?.repeatUntil ? dayjs(initialValues.repeatUntil) : null,
});
