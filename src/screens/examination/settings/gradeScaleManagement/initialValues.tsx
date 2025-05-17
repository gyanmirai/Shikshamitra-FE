export const getInitialValues = (editData?: any) => ({
  name: editData?.name || '',
  totalMarks: editData?.totalMarks || 0,
  gradingScale: editData?.gradingScale || [],
});
