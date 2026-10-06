'use client';

import type { RefObject } from 'react';
import type { FormikProps } from 'formik';

import { useRef, useEffect } from 'react';

import type { IProrationPolicyFormValues } from '../types/finance-policy.types';

export function useProrationValidationFocus(
  formik: FormikProps<IProrationPolicyFormValues>,
  formRef: RefObject<HTMLFormElement | null>
) {
  const focusedSubmit = useRef(0);
  useEffect(() => {
    if (!formik.submitCount) {
      focusedSubmit.current = 0;
      return undefined;
    }
    if (
      !formik.submitCount ||
      formik.isSubmitting ||
      formik.isValidating ||
      focusedSubmit.current === formik.submitCount ||
      !Object.keys(formik.errors).length
    )
      return undefined;
    // Error rows expand in a layout effect before focusing their mounted controls.
    const frame = requestAnimationFrame(() => {
      const invalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]:not([type="hidden"]):not([aria-hidden="true"]), [data-validation-error]'
      );
      if (invalid) {
        invalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
        invalid.focus({ preventScroll: true });
        focusedSubmit.current = formik.submitCount;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [formik.submitCount, formik.isSubmitting, formik.isValidating, formik.errors, formRef]);
}
