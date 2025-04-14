import dayjs from 'dayjs';

export const getSubjectInitialValues = (editData?: any) => ({
  subjectCode: editData?.subjectCode || '',
  subjectName: editData?.subjectName || '',
  scheduleDate: editData?.scheduleDate || dayjs(),
  className: editData?.className || '',
  primaryTeacher: editData?.primaryTeacher || '',
  secondaryTeacher: editData?.secondaryTeacher || [],
  learningGoal: editData?.learningGoal || '',
  prerequisites: editData?.prerequisites || '',
  description: editData?.description || '',
  subjectColor: editData?.subjectColor || '',
  status: editData?.status || 'Unpublish',
});
