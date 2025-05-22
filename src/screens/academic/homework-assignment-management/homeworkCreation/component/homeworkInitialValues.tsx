import dayjs from 'dayjs';

import type { IHomework } from '../type';

export const getHomeworkInitialValues = (editData?: IHomework | null): IHomework => ({
  title: editData?.title || '',
  description: editData?.description || '',
  class: editData?.class || '',
  division: editData?.division || [],
  subjects: editData?.subjects || [],
  chapters: editData?.chapters || [],
  homeworkType: editData?.homeworkType || '',
  submissionType: editData?.submissionType || '',
  dueDate: dayjs(editData?.dueDate) || null,
  attachments: editData?.attachments || [],
  createdBy: editData?.createdBy || '',
  status: editData?.status || 'draft',

  // Homework specific fields
  isDailyTask: editData?.isDailyTask || false,
  dayOfSubmission: editData?.dayOfSubmission || '',
  endDate: dayjs(editData?.endDate) || null,

  // Scheduling
  isScheduled: editData?.isScheduled || false,
  scheduleDate: dayjs(editData?.scheduleDate) || null,

  // System fields
  todaysDate: dayjs(editData?.todaysDate) || dayjs(dayjs().format('DD-MM-YYYY')),
});
