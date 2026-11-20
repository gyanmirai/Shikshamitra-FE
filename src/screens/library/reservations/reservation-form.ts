import type { Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { toDateOnly } from 'src/utils/date-only';

export type ReservationValues = {
  memberId: string;
  memberScan: string;
  requestedDate: Dayjs | null;
  requestExpiryDate: Dayjs | null;
  pickupSectionId?: string;
};
export type ReservationFieldState = Pick<
  FormikProps<ReservationValues>,
  'values' | 'touched' | 'errors' | 'setFieldValue' | 'setFieldTouched'
>;
export const emptyReservationValues: ReservationValues = {
  memberId: '',
  memberScan: '',
  requestedDate: null,
  requestExpiryDate: null,
  pickupSectionId: '',
};
export function reservationSchema(requiresExplicitExpiry: boolean) {
  return Yup.object({
    memberId: Yup.string().required('Select a resolved library member'),
    requestedDate: Yup.mixed<Dayjs>()
      .nullable()
      .required('Enter the requested school date')
      .test('valid-date', 'Enter a valid requested date', (value) =>
        Boolean(value && dayjs(value).isValid())
      ),
    requestExpiryDate: Yup.mixed<Dayjs>()
      .nullable()
      .test(
        'required-expiry',
        'Enter the expiry required by this policy',
        (value) => !requiresExplicitExpiry || Boolean(value)
      )
      .test(
        'valid-expiry',
        'Enter a valid request expiry date',
        (value) => !value || dayjs(value).isValid()
      )
      .test(
        'expiry-order',
        'Request expiry cannot be before the requested date',
        (value, context) =>
          !value ||
          !context.parent.requestedDate ||
          toDateOnly(value) >= toDateOnly(context.parent.requestedDate)
      ),
  });
}
export function buildReservationPayload(
  values: Pick<ReservationValues, 'requestedDate' | 'requestExpiryDate' | 'pickupSectionId'>,
  memberId: string
) {
  return {
    memberId,
    requestedDate: toDateOnly(values.requestedDate),
    requestExpiryDate: values.requestExpiryDate ? toDateOnly(values.requestExpiryDate) : undefined,
    ...(values.pickupSectionId ? { pickupSectionId: values.pickupSectionId } : {}),
  };
}
