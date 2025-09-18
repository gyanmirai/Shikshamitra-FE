import type { ISurveyType } from '../type';

export const getSurveyTypeInitialValues = (editData: ISurveyType | null) => ({
  surveyType: editData?.surveyType || '',
  description: editData?.description || '',
});
