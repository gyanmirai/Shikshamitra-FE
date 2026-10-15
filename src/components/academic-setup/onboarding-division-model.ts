import * as Yup from 'yup';

export const onboardingDivisionSchema = Yup.object({
  name: Yup.string().trim().max(50).required('Division name is required'),
  strength: Yup.number()
    .typeError('Strength must be a number')
    .integer('Strength must be an integer')
    .positive('Strength must be positive')
    .required('Strength is required'),
});

export function onboardingDivisionInput(
  values: { name: string; strength: string | number },
  classId: string | number
) {
  return { name: values.name.trim(), strength: Number(values.strength), standardId: classId };
}
