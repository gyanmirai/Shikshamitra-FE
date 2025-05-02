import * as Yup from 'yup';

export const feedbackAnalyticsValidationSchema = Yup.object().shape({
  mealName: Yup.string().required('Meal Name is required'),
  mealDay: Yup.string().required('Meal Day is required'),
  mealType: Yup.string().required('Meal Type is required'),
  mealDescription: Yup.string().required('Meal Description is required'),
  overallMealRating: Yup.number().required('Overall Rating is required').min(1).max(5),
  overallComplaintStatus: Yup.string().required('Complaint Status is required'),
  howMuchOkay: Yup.number().min(0).required('Required'),
  howMuchBad: Yup.number().min(0).required('Required'),
  howMuchSuperb: Yup.number().min(0).required('Required'),
  howMuchExcellent: Yup.number().min(0).required('Required'),
  howMuchVeryBad: Yup.number().min(0).required('Required'),
  howMuchlovedIt: Yup.number().min(0).required('Required'),
});
