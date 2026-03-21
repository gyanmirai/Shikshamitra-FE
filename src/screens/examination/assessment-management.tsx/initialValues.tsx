import dayjs from 'dayjs';

import type { IAssessment } from './type';

export const getInitialValues = (data: IAssessment | null) => ({
  className: data?.className || '',
  division: data?.division || '',
  subject: data?.subject || '',
  assessmentTitle: data?.assessmentTitle || '',
  assessmentType: data?.assessmentType || '',
  examName: data?.examName || '',
  assignmentName: data?.assignmentName || '',
  createDate: data?.createDate ? dayjs(data?.createDate.toString()) : dayjs(),
  dueDate: data?.dueDate ? dayjs(data?.dueDate.toString()) : null,
  publish: data?.publish || false,
  status: data?.status || '',
});
