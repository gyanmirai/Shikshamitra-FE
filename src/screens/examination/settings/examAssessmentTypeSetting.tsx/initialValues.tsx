import type { IExamType } from './type';

export const getExamTypeInitialValues = (editData: IExamType) => ({
  examType: editData?.examType || '',
  description: editData?.description || '',
});

export const getAssessmentTypeInitialValues = (editData: any) => ({
  assessmentType: editData?.assessmentType || '',
  description: editData?.description || '',
});
