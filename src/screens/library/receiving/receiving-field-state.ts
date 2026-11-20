import type { FormikProps } from 'formik';

import { getIn } from 'formik';

import type { ReceivingValues } from './receiving-form';

export type ReceivingForm = FormikProps<ReceivingValues>;
export function receivingFieldError(formik: ReceivingForm, path: string): string | undefined {
  if (!getIn(formik.touched, path) && !formik.submitCount) return undefined;
  const error = getIn(formik.errors, path);
  return typeof error === 'string' ? error : typeof error?.id === 'string' ? error.id : undefined;
}
export const receivingSources = [
  { id: 0, name: 'Purchase' },
  { id: 1, name: 'Donation' },
  { id: 2, name: 'Opening stock' },
  { id: 3, name: 'Other' },
];
