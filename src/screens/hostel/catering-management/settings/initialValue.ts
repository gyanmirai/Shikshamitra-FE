import type { IAddMealSlotForm } from './meal-slots-interfcae';

export const getMealSlotInitialValues = (
  data: Partial<IAddMealSlotForm> | null = null
): IAddMealSlotForm => ({
  mealSlotsName: data?.mealSlotsName || '',
  description: data?.description || '',
});
