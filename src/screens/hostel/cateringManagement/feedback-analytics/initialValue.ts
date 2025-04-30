import type { IFeedbackAnalyticsForMeal } from './feedback-analytics-interface';

export const getFeedbackAnalyticsInitialValues = (
  data: Partial<IFeedbackAnalyticsForMeal> | null = null
): IFeedbackAnalyticsForMeal => ({
  mealName: data?.mealName || '',
  mealDay: data?.mealDay || '',
  mealType: data?.mealType || '',
  mealDescription: data?.mealDescription || '',
  overallMealRating: data?.overallMealRating || 0,
  overallComplaintStatus: data?.overallComplaintStatus || '',
  howMuchOkay: data?.howMuchOkay || 0,
  howMuchBad: data?.howMuchBad || 0,
  howMuchSuperb: data?.howMuchSuperb || 0,
  howMuchExcellent: data?.howMuchExcellent || 0,
  howMuchVeryBad: data?.howMuchVeryBad || 0,
  howMuchlovedIt: data?.howMuchlovedIt || 0,
  reviewBy: data?.reviewBy || [],
});
