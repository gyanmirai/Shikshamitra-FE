import dayjs from 'dayjs';

import { allStudentIds } from './assignmentForm';

import type { IAssignment } from '../type';

export const getAssignmentInitialValues = (editData: IAssignment | null, classes: string) => ({
  title: editData?.title || '',
  description: editData?.description || '',
  class: editData?.class || classes || '',
  totalMarks: editData?.totalMarks || 0,
  divisions:
    editData?.divisions?.map((div) => ({
      divisionId: div.divisionId,
      createdAt: div.createdAt ? dayjs(div.createdAt) : null,
      publishDate: div.publishDate ? dayjs(div.publishDate) : null,
      dueDate: div.dueDate ? dayjs(div.dueDate) : null,
      status: div.status ?? 0,
    })) || [],
  students: editData?.students?.length
    ? editData.students
    : editData?.divisions?.length
      ? allStudentIds
      : [],
  subjects: editData?.subjects || '',
  submissionType: editData?.submissionType || 0,
  // dueDate: dayjs(editData?.dueDate) || null,
  attachments: editData?.attachments || [],
  startDate: editData?.startDate ? dayjs(editData.startDate) : dayjs(),
  endDate: editData?.endDate ? dayjs(editData.endDate) : null,
  createdBy: editData?.createdBy || {},

  // Assignment specific fields
  assignmentType: editData?.assignmentType || '',

  // Scheduling
  // isScheduled: editData?.isScheduled || false,
  // scheduleDate: dayjs(editData?.scheduleDate) || null,

  // System fields
  // todaysDate: dayjs(editData?.todaysDate) || dayjs(dayjs().format('DD-MM-YYYY')),
});
