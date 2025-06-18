import dayjs from 'dayjs';

import type { IAssignment } from '../type';

export const getAssignmentInitialValues = (editData: IAssignment | null, classes: string) => ({
  title: editData?.title || '',
  description: editData?.description || '',
  class: editData?.class || classes || '',
  division: editData?.division || [],
  subjects: editData?.subjects || '',
  rubric: '',
  submissionType: editData?.submissionType || 0,
  // dueDate: dayjs(editData?.dueDate) || null,
  attachments: editData?.attachments || [],
  startDate: editData?.startDate ? dayjs(editData.startDate) : dayjs(),
  endDate: editData?.endDate ? dayjs(editData.endDate) : null,
  createdBy: editData?.createdBy || {},
  status: editData?.status || 0,

  // Assignment specific fields
  assignmentType: editData?.assignmentType || '',

  // Scheduling
  // isScheduled: editData?.isScheduled || false,
  // scheduleDate: dayjs(editData?.scheduleDate) || null,

  // System fields
  // todaysDate: dayjs(editData?.todaysDate) || dayjs(dayjs().format('DD-MM-YYYY')),
});
