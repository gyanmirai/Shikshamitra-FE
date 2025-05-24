import dayjs from 'dayjs';

import type { IHomework } from '../type';

export const getHomeworkInitialValues = (
  editData: IHomework | null,
  classes: string
): IHomework => ({
  title: editData?.title || '',
  description: editData?.description || '',
  class: editData?.class || classes || '',
  division: editData?.division || [],
  subject: editData?.subject || '',
  chapters: editData?.chapters || [],
  homeworkType: editData?.homeworkType || '',
  submissionType: editData?.submissionType || 'online_text',
  dueDate: dayjs(editData?.dueDate) || null,
  attachments: editData?.attachments || [],
  createdBy: editData?.createdBy || '',
  status: editData?.status || 0,

  // Homework specific fields
  isDailyTask: editData?.isDailyTask || false,
  endDate: dayjs(editData?.endDate) || null,

  // Scheduling
  isScheduled: editData?.isScheduled || false,
  scheduleDate: dayjs(editData?.scheduleDate) || null,

  // System fields
  todaysDate: dayjs(editData?.todaysDate) || dayjs(dayjs().format('DD-MM-YYYY')),
});
