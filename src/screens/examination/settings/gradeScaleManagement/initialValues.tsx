export const getInitialValues = (editData?: any) => ({
  name: editData?.name || '',
  totalMarks: editData?.totalMarks || '',
  gradingScale: editData?.gradingScale || [],
});
