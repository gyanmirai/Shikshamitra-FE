import { getIn, type FormikProps } from 'formik';

/**
 * Returns the error string for a Formik field path if it should be displayed.
 * `forceShow` (e.g. after submit) bypasses the `touched` check.
 */
export const getFieldError = <T>(
  formik: FormikProps<T>,
  path: string,
  forceShow = false
): string | undefined => {
  const error = getIn(formik.errors, path);
  const touched = getIn(formik.touched, path);
  if (typeof error !== 'string') return undefined;
  if (!forceShow && !touched) return undefined;
  return error;
};

export const hasFieldError = <T>(
  formik: FormikProps<T>,
  path: string,
  forceShow = false
): boolean => Boolean(getFieldError(formik, path, forceShow));

/**
 * Helper to read array-level errors that Yup attaches as a string to the array path itself,
 * e.g. `slotConfigurations[0].timeSlots` "At least one slot is required".
 */
export const getArrayLevelError = <T>(formik: FormikProps<T>, path: string): string | undefined => {
  const error = getIn(formik.errors, path);
  return typeof error === 'string' ? error : undefined;
};
