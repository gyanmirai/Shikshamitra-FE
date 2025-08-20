import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

export const feeRefundProcessvalidationSchema = Yup.object().shape({
  // validate only current refundMethod's paymentDetails
  paymentDetails: Yup.object().when(['refundMethod'], ([refundMethod], schema) => {
    if (!refundMethod || !paymentMethodsConfig[refundMethod as keyof typeof paymentMethodsConfig])
      return schema; // no validation if method not chosen

    return Yup.object(
      Object.fromEntries(
        paymentMethodsConfig[refundMethod as keyof typeof paymentMethodsConfig].map((field) => [
          field.name,
          field.required
            ? field.type === 'date'
              ? Yup.mixed()
                  .required(`${field.label} is required`)
                  .test(
                    'is-valid-dayjs',
                    `${field.label} must be a valid date`,
                    (value) => value && dayjs(value as Dayjs).isValid()
                  )
              : Yup.string().required(`${field.label} is required`)
            : field.type === 'date'
              ? Yup.mixed()
                  .nullable()
                  .test(
                    'is-valid-dayjs',
                    `${field.label} must be a valid date`,
                    (value) => !value || dayjs(value as Dayjs).isValid()
                  )
              : Yup.string(),
        ])
      )
    );
  }),
});
