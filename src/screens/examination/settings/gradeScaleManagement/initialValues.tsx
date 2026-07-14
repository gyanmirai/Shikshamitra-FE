export const getInitialValues = (editData?: any) => ({
  name: editData?.name || '',
  totalMarks: editData?.totalMarks || '',
  passMarks: editData?.passMarks !== undefined && editData?.passMarks !== null ? editData.passMarks : '',
  description: editData?.description || '',
  isDefault: editData?.isDefault || false,
  status: editData?.status !== undefined && editData?.status !== null ? editData.status : 0,
  gradingScale: editData?.gradingScale?.map((r: any) => ({
    minMarks: r.minMarks !== undefined && r.minMarks !== null ? r.minMarks : '',
    maxMarks: r.maxMarks !== undefined && r.maxMarks !== null ? r.maxMarks : '',
    grade: r.grade || '',
    gradePoint: r.gradePoint !== undefined && r.gradePoint !== null ? r.gradePoint : '',
    remark: r.remark || '',
    resultStatus: r.resultStatus !== undefined && r.resultStatus !== null ? r.resultStatus : 0,
  })) || [],
});
