import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

import { getInitialPaymentDetails } from '../Components/RefundProcessForm';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

export const buildRefundInitialValues = (editData?: Partial<any> | null) => {
  const initialValues: Record<string, any> = {
    board: editData?.board || '',
    medium: editData?.medium || '',
    className: editData?.className || '',
    division: editData?.division || '',
    student: editData?.student || '',
    paidTerms: editData?.paidTerms || '',
    amountApplicable: editData?.amountApplicable || '',
    refundMethod: editData?.refundMethod || '',
    selectedTerms: editData?.selectedTerms || [],
    selectedFeeHeads: editData?.selectedFeeHeads || [],
    selectedCharges: editData?.selectedCharges || [],

    totalAmount: editData?.totalAmount || '', // calculated
    refundAmount: editData?.refundAmount || '', // user input
    reason: editData?.reason || '',
    notes: editData?.notes || '',
    paymentDetails: {
      ...getInitialPaymentDetails(editData?.refundMethod),
      ...(editData?.paymentDetails || {}), // merge if student already has values
    },
  };

  return initialValues;
};

export const buildRefundValidationSchema = () =>
  Yup.object({
    board: Yup.string().required('Board is required'),
    medium: Yup.string().required('Medium is required'),
    className: Yup.string().required('Class is required'),
    division: Yup.string().required('Division is required'),
    student: Yup.string().required('Student is required'),
    paidTerms: Yup.string().required('Paid terms are required'),
    amountApplicable: Yup.number()
      .transform((value, originalValue) => {
        if (typeof originalValue === 'string') {
          const cleaned = originalValue.replace(/[₹,\s]/g, '');
          return Number(cleaned);
        }
        return value;
      })
      .required('Applicable amount is required')
      .positive('Amount must be positive'),
    refundMethod: Yup.string().required('Select a refund method'),
    selectedTerms: Yup.array().min(1, 'Select at least one term to refund'),
    totalAmount: Yup.number()
      .transform((value, originalValue) => {
        if (typeof originalValue === 'string') {
          const cleaned = originalValue.replace(/[₹,\s]/g, '');
          return Number(cleaned);
        }
        return value;
      })
      .required('Total amount is required')
      .positive('Amount must be positive'),
    refundAmount: Yup.number()
      .transform((value, originalValue) => {
        if (typeof originalValue === 'string') {
          const cleaned = originalValue.replace(/[₹,\s]/g, '');
          return Number(cleaned);
        }
        return value;
      })
      .required('Refund amount is required')
      .positive('Amount must be positive'),
    reason: Yup.string().required('Reason is required'),
    notes: Yup.string(),
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
