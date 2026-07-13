import type { IExamType } from './type';

export const getExamTypeInitialValues = (editData: IExamType) => ({
  examType: editData?.examType || '',
  description: editData?.description || '',
  category: editData?.category || '',
  status: editData?.status !== undefined && editData?.status !== null ? editData.status : 0,
  defaultTotalMarks: editData?.defaultTotalMarks !== undefined && editData?.defaultTotalMarks !== null ? editData.defaultTotalMarks : '',
  defaultWeightage: editData?.defaultWeightage !== undefined && editData?.defaultWeightage !== null ? editData.defaultWeightage : '',
  includedInResult: editData?.includedInResult !== undefined ? editData.includedInResult : true,
  marksEntryRequired: editData?.marksEntryRequired !== undefined ? editData.marksEntryRequired : true,
  gradeScaleRequired: editData?.gradeScaleRequired !== undefined ? editData.gradeScaleRequired : true,
  allowPracticalOral: editData?.allowPracticalOral !== undefined ? editData.allowPracticalOral : false,
  defaultGradeScaleId: editData?.defaultGradeScaleId || '',
});

export const getAssessmentTypeInitialValues = (editData: any) => ({
  assessmentType: editData?.assessmentType || '',
  description: editData?.description || '',
});
