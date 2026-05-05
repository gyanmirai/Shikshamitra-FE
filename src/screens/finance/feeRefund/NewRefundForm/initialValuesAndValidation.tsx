import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

import { getInitialPaymentDetails } from '../Components/RefundProcessForm';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { IPaymentFieldConfig } from '../../FeeCollection/Components/type';

// ─── Internal types ───────────────────────────────────────────────────────────

interface ICurrentYear {
  startDate?: string | Date;
  endDate?: string | Date;
}

interface IPaymentDetailsContext {
  totalAmount?: number;
}

export interface IFeeRefundEditData {
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  divisionId?: string;
  studentId?: string;
  studentName?: string;
  refundMethod?: string;
  notes?: string;
  paymentDetails?: Record<string, unknown>;
  feeHeadRefunds?: IFeeHeadRefundItem[];
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IFeeHeadMonthRefund {
  month: string;
  amount: number;
}

export interface IFeeHeadRefundItem {
  feeHeadId: string;
  months: IFeeHeadMonthRefund[];
}

export interface IFeeRefundPayload {
  studentId: string;
  studentName: string;
  refundMethod: string;
  paymentDetails: Record<string, unknown>;
  notes: string;
  feeHeadRefunds: IFeeHeadRefundItem[];
}

export interface IRefundFormValues {
  boardId: string;
  mediumId: string;
  standardId: string;
  divisionId: string;
  studentId: string;
  studentName: string;
  refundMethod: string;
  notes: string;
  paymentDetails: Record<string, unknown>;
  feeHeadRefunds: IFeeHeadRefundItem[];
}

// ─── Build payload from formik values ────────────────────────────────────────
// feeHeadRefunds is already in the correct array format — pass through directly.

export const buildFeeRefundPayload = (values: IRefundFormValues): IFeeRefundPayload => ({
  studentId: values.studentId,
  studentName: values.studentName,
  refundMethod: values.refundMethod,
  paymentDetails: values.paymentDetails,
  notes: values.notes,
  feeHeadRefunds: (values.feeHeadRefunds || []) as IFeeHeadRefundItem[],
});

// ─── Initial Values ───────────────────────────────────────────────────────────

export const buildRefundInitialValues = (
  editData?: IFeeRefundEditData | null
): IRefundFormValues => ({
  boardId: editData?.boardId || '',
  mediumId: editData?.mediumId || '',
  standardId: editData?.standardId || '',
  divisionId: editData?.divisionId || '',
  studentId: editData?.studentId || '',
  studentName: editData?.studentName || '',
  refundMethod: editData?.refundMethod || '',
  notes: editData?.notes || '',
  paymentDetails: {
    ...getInitialPaymentDetails(editData?.refundMethod),
    ...(editData?.paymentDetails || {}),
  },
  // Array of { feeHeadId, months: { month, amount }[] } — populated when student is selected
  feeHeadRefunds: (editData?.feeHeadRefunds || []) as IFeeHeadRefundItem[],
});

// ─── Validation Schema ────────────────────────────────────────────────────────

export const buildRefundValidationSchema = (currentYear: ICurrentYear) =>
  Yup.object({
    boardId: Yup.string().required('Board is required'),
    mediumId: Yup.string().required('Medium is required'),
    standardId: Yup.string().required('Class is required'),
    divisionId: Yup.string().required('Division is required'),
    studentId: Yup.string().required('Student is required'),
    refundMethod: Yup.string().required('Select a refund method'),
    notes: Yup.string(),
    feeHeadRefunds: Yup.mixed().test(
      'at-least-one-refund',
      'Enter a refund amount for at least one month',
      (value) => {
        if (!Array.isArray(value)) return false;
        const refunds = value as IFeeHeadRefundItem[];
        return refunds.some((fh) => fh.months.some((m) => Number(m.amount) > 0));
      }
    ),
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
  currentYear: ICurrentYear,
  formValues: IPaymentDetailsContext
) => {
  let schema: Yup.Schema<unknown>;

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
        return total == null || Number(value) <= total;
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
