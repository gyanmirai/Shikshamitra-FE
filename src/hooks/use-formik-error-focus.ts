import { useRef, useEffect } from 'react';
import { focusFirstFormikError } from 'src/components/custom-stepper/formik-validation';

/** Focus once after each failed submit, after Formik has rendered validation errors. */
export function useFormikErrorFocus({
  errors,
  submitCount,
  isSubmitting,
  isValidating,
}: {
  errors: unknown;
  submitCount: number;
  isSubmitting: boolean;
  isValidating: boolean;
}) {
  const focusedSubmit = useRef(0);
  useEffect(() => {
    if (submitCount < focusedSubmit.current) focusedSubmit.current = submitCount;
    if (isSubmitting || isValidating || submitCount <= focusedSubmit.current) return;
    focusedSubmit.current = submitCount;
    focusFirstFormikError(errors);
  }, [errors, submitCount, isSubmitting, isValidating]);
}
