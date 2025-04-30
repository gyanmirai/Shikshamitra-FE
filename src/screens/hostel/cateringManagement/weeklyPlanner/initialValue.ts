import type { IMealFormValues } from './weekly-planner-interface';

export function getMealInitialValues(
  data: Partial<IMealFormValues> | null = null
): IMealFormValues {
  return {
    mealType: data?.mealType || '',
    mealDay: data?.mealDay || '',
    mealDescription: data?.mealDescription || '',
    mealImage: data?.mealImage || null,
  };
}
