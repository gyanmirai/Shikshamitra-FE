import * as Yup from 'yup';
import { duplicateDivisionMessage } from 'src/utils/duplicate-division-error';

export type ExistingDivision = { id: string; name: string };

export const divisionFormSchema = (divisions: ExistingDivision[] = [], currentId?: string) =>
  Yup.object({
    name: Yup.string()
      .trim()
      .max(64)
      .required('Division name is required')
      .test('unique-division-name', duplicateDivisionMessage(), function validateUniqueName(value) {
        const duplicate = divisions.some(
          (division) =>
            division.id !== currentId &&
            division.name.trim().toLowerCase() === value?.trim().toLowerCase()
        );
        return !duplicate || this.createError({ message: duplicateDivisionMessage(value) });
      }),
    strength: Yup.number()
      .typeError('Strength must be a number')
      .integer('Strength must be an integer')
      .positive('Strength must be positive')
      .max(500, 'Strength must be at most 500')
      .required('Strength is required'),
  });

export const onboardingDivisionSchema = divisionFormSchema();

export function onboardingDivisionInput(
  values: { name: string; strength: string | number },
  classId: string | number
) {
  return { name: values.name.trim(), strength: Number(values.strength), standardId: classId };
}
