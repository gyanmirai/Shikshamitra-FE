export interface IMealFormValues {
  mealType: string;
  mealDay: string;
  mealDescription: string;
  mealImage?: any;
  startTime?: string;
  endTime?: string;
}

export interface IAddWeeklyMenuDialogProps {
  data: IMealFormValues | null;
  onClose: () => void;
  isEdit?: boolean;
}
