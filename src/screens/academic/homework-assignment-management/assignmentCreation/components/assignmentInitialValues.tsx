import dayjs from 'dayjs';

import type { IAssignment } from '../type';

export const getAssignmentInitialValues = (editData: IAssignment | null, classes: string) => ({
  title: editData?.title || '',
  description: editData?.description || '',
  className: editData?.className || '',
  classId: editData?.classId || classes || '',

  totalMarks: editData?.totalMarks || '',
  divisions:
    editData?.divisions?.map((div) => ({
      divisionId: div.divisionId,
      divisionName: div.divisionName,
      createdAt: div.createdAt ? dayjs(div.createdAt) : null,
      publishDate: div.publishDate ? dayjs(div.publishDate) : null,
      dueDate: div.dueDate ? dayjs(div.dueDate) : null,
      status: div.status ?? 0,
    })) || [],
  students: editData?.students?.length ? editData.students : [],
  subjectName: editData?.subjectName || '',
  subjectId: editData?.subjectId || '',

  submissionType: editData?.submissionType || 0,
  // dueDate: dayjs(editData?.dueDate) || null,
  attachments: editData?.attachments || [],
  startDate: editData?.startDate ? dayjs(editData.startDate) : dayjs(),
  endDate: editData?.endDate ? dayjs(editData.endDate) : null,
  createdBy: editData?.createdBy || {},

  // Assignment specific fields
  assignmentTypeId: editData?.assignmentTypeId || '',

  // Scheduling
  // isScheduled: editData?.isScheduled || false,
  // scheduleDate: dayjs(editData?.scheduleDate) || null,

  // System fields
  // todaysDate: dayjs(editData?.todaysDate) || dayjs(dayjs().format('DD-MM-YYYY')),
});
