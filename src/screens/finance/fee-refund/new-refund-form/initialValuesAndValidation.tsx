import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

import { getInitialPaymentDetails } from '../components/RefundProcessForm';
import { paymentMethodsConfig } from '../../fee-collection/components/paymentConfigMethods';

import type { IPaymentFieldConfig } from '../../fee-collection/components/type';

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

export const buildRefundValidationSchema = (currentYear: any) =>
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
    paymentDetails: Yup.object().when(['refundMethod'], ([refundMethod], schema, context) => {
      if (!refundMethod || !paymentMethodsConfig[refundMethod as keyof typeof paymentMethodsConfig])
        return schema;

      return Yup.object(
        Object.fromEntries(
          paymentMethodsConfig[refundMethod as keyof typeof paymentMethodsConfig].map((field) => [
            field.name,
            buildFieldValidation(field, currentYear, context?.parent),
          ])
        )
      );
    }),
  });

export const buildFieldValidation = (
  field: IPaymentFieldConfig,
  currentYear: any,
  formValues: any
) => {
  let schema: Yup.Schema<any>;

  if (field.type === 'date') {
    schema = field.required
      ? Yup.mixed()
          .required(`${field.label} is required`)
          .test(
            'is-valid-dayjs',
            `${field.label} must be a valid date`,
            (value) => value && dayjs(value as Dayjs).isValid()
          )
          .test(
            'min-date',
            (value) =>
              `${field.label} must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
          )
          .test(
            'max-date',
            (value) =>
              `${field.label} must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
          )
      : Yup.mixed()
          .nullable()
          .test(
            'is-valid-dayjs',
            `${field.label} must be a valid date`,
            (value) => !value || dayjs(value as Dayjs).isValid()
          )
          .test(
            'min-date',
            (value) =>
              `${field.label} must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
            (value) =>
              !value || dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
          )
          .test(
            'max-date',
            (value) =>
              `${field.label} must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
            (value) =>
              !value || dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
          );
  } else if (field.type === 'amount' || field.type === 'number') {
    schema = Yup.number()
      .typeError(`${field.label} must be a number`)
      .transform((val, orig) => {
        if (typeof orig === 'string') return Number(orig.replace(/[₹,\s]/g, ''));
        return val;
      })
      .min(field.min ?? 0, `${field.label} must be greater than ${field.min ?? 0}`);
    schema = schema.test(
      'max-total',
      `${field.label} cannot be greater than Total Amount`,
      (value) => {
        if (value == null) return true;
        const total = formValues?.totalAmount;
        return total == null || value <= total;
      }
    );
    if (field.required) schema = schema.required(`${field.label} is required`);
  } else {
    schema = Yup.string();
    if (field.required) schema = schema.required(`${field.label} is required`);
  }

  if (field.pattern) {
    schema = (schema as Yup.StringSchema).matches(
      new RegExp(field.pattern),
      field.patternMessage || `${field.label} is invalid`
    );
  }
  return schema;
};
