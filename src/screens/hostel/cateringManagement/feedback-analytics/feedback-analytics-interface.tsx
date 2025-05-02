export interface IFeedbackAnalyticsForMeal {
  mealName: string;
  mealDay: string;
  mealType: string;
  mealDescription: string;
  overallMealRating: number;
  overallComplaintStatus: string;
  howMuchOkay: number;
  howMuchBad: number;
  howMuchSuperb: number;
  howMuchAmezing: number;
  howMuchVeryBad: number;
  howMuchlovedIt: number;
  reviewBy: IreviewBy[];
}

export interface IreviewBy {
  name: string;
  status: number;
  message: string;
}

export interface IFeedbackDetailsViewDialogProps {
  data: IFeedbackAnalyticsForMeal;
}
