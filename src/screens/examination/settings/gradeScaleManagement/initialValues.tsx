export const getInitialValues = (editData?: any) => ({
  totalMarks: editData?.totalMarks || 0,
  gradingScale: editData?.gradingScale || [],
});
