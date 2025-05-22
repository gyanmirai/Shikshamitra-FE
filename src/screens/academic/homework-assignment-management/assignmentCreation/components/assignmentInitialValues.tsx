import dayjs from 'dayjs';

import type { IAssignment } from '../type';

export const getAssignmentInitialValues = (editData: IAssignment | null) => ({
  title: editData?.title || '',
  description: editData?.description || '',
  class: editData?.class || '',
  division: editData?.division || [],
  subjects: editData?.subjects || [],
  submissionType: editData?.submissionType || '',
  dueDate: dayjs(editData?.dueDate) || null,
  attachments: editData?.attachments || [],
  createdBy: editData?.createdBy || '',
  status: editData?.status || 'draft',

  // Assignment specific fields
  assignmentType: editData?.assignmentType || '',
  rubricRequired: editData?.rubricRequired || false,
  rubric: editData?.rubric || '',
  rubricAttachment: editData?.rubricAttachment || [],

  // Scheduling
  isScheduled: editData?.isScheduled || false,
  scheduleDate: dayjs(editData?.scheduleDate) || null,

  // System fields
  todaysDate: dayjs(editData?.todaysDate) || dayjs(dayjs().format('DD-MM-YYYY')),
});
