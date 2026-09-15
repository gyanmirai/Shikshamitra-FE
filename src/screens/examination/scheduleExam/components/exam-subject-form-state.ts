import type { FormikState } from 'formik';

import { pruneRoomDetails } from './initialValues';

import type { IExamFormValues } from '../type';

/**
 * Applies a Subjects-field change without retaining a stale array-level error.
 * Nested schedule errors are intentionally preserved for later workflow steps.
 */
export const applyExamSubjectSelection = (
  currentState: FormikState<IExamFormValues>,
  subjects: IExamFormValues['subjects']
): FormikState<IExamFormValues> => {
  const errors = { ...currentState.errors };

  if (subjects.length > 0 && typeof errors.subjects === 'string') {
    delete errors.subjects;
  }

  return {
    ...currentState,
    values: {
      ...currentState.values,
      subjects,
      roomDetails: pruneRoomDetails(
        currentState.values.roomDetails,
        subjects,
        currentState.values.divisions
      ),
    },
    errors,
  };
};
