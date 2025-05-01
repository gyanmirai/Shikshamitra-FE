export const getSubjectInitialValues = (editData?: any) => ({
  subjectCode: editData?.subjectCode || '',
  subjectName: editData?.subjectName || '',
  className: editData?.className || '',
  primaryTeacher: editData?.primaryTeacher || '',
  secondaryTeacher: editData?.secondaryTeacher || [],
  learningGoal: editData?.learningGoal || '',
  prerequisites: editData?.prerequisites || '',
  description: editData?.description || '',
  subjectColor: editData?.subjectColor || '',
  status: editData?.status || 'UnPublish',
});
