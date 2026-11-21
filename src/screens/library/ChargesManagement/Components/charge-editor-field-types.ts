import type { FormikProps } from 'formik';

import type { ChargeEditorValues } from './ChargeAssessmentInputs';

export type ChargeEditorFieldProps = {
  formik: FormikProps<ChargeEditorValues>;
  disabled: boolean;
};

export const chargeEditorFieldError = (
  formik: FormikProps<ChargeEditorValues>,
  field: keyof ChargeEditorValues
) =>
  (formik.touched[field] || formik.submitCount > 0) && typeof formik.errors[field] === 'string'
    ? String(formik.errors[field])
    : undefined;
