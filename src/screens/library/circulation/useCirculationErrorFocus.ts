import type { RefObject } from 'react';

import { useRef, useEffect } from 'react';
import { focusFirstFormikError } from 'src/components/custom-stepper/formik-validation';

export function useCirculationErrorFocus(
  form: { submitCount: number; isSubmitting: boolean; errors: unknown },
  root: RefObject<HTMLFormElement | null>
) {
  const focused = useRef(0);
  useEffect(() => {
    if (form.isSubmitting || form.submitCount <= focused.current) return;
    focused.current = form.submitCount;
    focusFirstFormikError(form.errors, root.current || undefined);
  }, [form.submitCount, form.isSubmitting, form.errors, root]);
}
