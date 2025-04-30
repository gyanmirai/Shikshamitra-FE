import * as Yup from 'yup';

export const mealValidationSchema = Yup.object().shape({
  mealType: Yup.string().required('Meal type is required'),
  mealDay: Yup.string().required('Meal day is required'),
  mealDescription: Yup.string().required('Meal description is required'),
});
