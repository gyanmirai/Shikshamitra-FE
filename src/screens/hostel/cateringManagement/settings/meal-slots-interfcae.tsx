export interface IAddMealSlotForm {
  mealSlotsName: string;
  description: string;
}

export interface IAddMealSlotsDialogProps {
  data: IAddMealSlotForm | null;
  onClose: () => void;
  isEdit: boolean;
}
