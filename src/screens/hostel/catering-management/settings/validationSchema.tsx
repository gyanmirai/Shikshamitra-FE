import * as Yup from 'yup';

export const mealSlotValidationSchema = Yup.object().shape({
  mealSlotsName: Yup.string()
    .required('Meal Slot Name is required')
    .min(2, 'Minimum 2 characters')
    .max(50, 'Maximum 50 characters'),
  description: Yup.string().required('Description is required').min(5, 'Minimum 5 characters'),
});
