import dayjs from 'dayjs';
import * as Yup from 'yup';

import type { IUpdateChargeFormValues } from './types';

function getFirstValidationMessage(errors: Record<string, unknown>): string | undefined {
  return Object.values(errors).reduce<string | undefined>((found, value) => {
    if (found) {
      return found;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      return getFirstValidationMessage(value as Record<string, unknown>);
    }
    return undefined;
  }, undefined);
}

/**
 * Creates validation schema for Update Charge Form
 * Supports both single class and multi-class scenarios
 */
export const createUpdateChargeValidationSchema = (currentYear: any, isEditMode: boolean) =>
  Yup.object({
    chargeId: isEditMode ? Yup.string().required('Charge ID is required') : Yup.string().optional(),

    // Charge Details
    chargeName: Yup.string()
      .required('Charge Name is required')
      .min(3, 'Charge Name must be at least 3 characters')
      .max(100, 'Charge Name cannot exceed 100 characters'),

    chargeCategoryId: Yup.string().required('Charge Category is required'),

    purposeDescription: Yup.string()
      .required('Purpose/Description is required')
      .min(10, 'Purpose/Description must be at least 10 characters')
      .max(500, 'Purpose/Description cannot exceed 500 characters'),

    amount: Yup.string()
      .required('Amount is required')
      .transform((value) => value.replace(/[^0-9.]/g, ''))
      .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
        const numericValue = Number(value);
        return numericValue > 0;
      }),

    dueDate: Yup.mixed()
      .required('Due Date is required')
      .test(
        'is-valid-dayjs',
        'Due Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Due Date must be on or after ${dayjs(currentYear?.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear?.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Due Date must be on or before ${dayjs(currentYear?.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear?.endDate), 'day')
      ),

    additionalNotes: Yup.string().max(1000, 'Additional Notes cannot exceed 1000 characters'),

    // Academic Structure - All required
    boardId: Yup.string().required('Board is required'),

    educationMediumId: Yup.string().required('Medium is required'),

    standardId: Yup.array()
      .min(1, 'Please select at least one class')
      .required('Class is required'),

    // Division - Required only if exactly one class is selected
    divisionIds: Yup.array().when('standardId', {
      is: (standardId: string[]) => Array.isArray(standardId) && standardId.length === 1,
      then: (schema) =>
        schema
          .min(1, 'Please select at least one division')
          .required('Division is required for single class'),
      otherwise: (schema) => schema,
    }),

    // Student Selection - At least one of these must be selected
    studentIds: Yup.array().of(Yup.string()),

    selectedStudents: Yup.array().of(
      Yup.object().shape({
        id: Yup.string().required(),
        label: Yup.string().required(),
      })
    ),
  }).test(
    'selection-required',
    'Please select at least one student, division, or class',
    (values) => {
      const hasStudents = values.studentIds && values.studentIds.length > 0;
      const hasDivisions = values.divisionIds && values.divisionIds.length > 0;
      const hasClass = Array.isArray(values.standardId) && values.standardId.length > 0;

      return !!(hasStudents || hasDivisions || hasClass);
    }
  );

export { getFirstValidationMessage };

/**
 * Simple validator function to check if form has errors
 */
export const validateUpdateChargeForm = async (
  values: IUpdateChargeFormValues,
  schema: Yup.ObjectSchema<any>
): Promise<{ [key: string]: string }> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors: { [key: string]: string } = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return errors;
    }
    return {};
  }
};
