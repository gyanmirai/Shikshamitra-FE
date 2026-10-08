import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import {
  refundPaymentMethodsConfig,
  getInitialRefundPaymentDetails,
  isRefundRequestField,
} from './refundPaymentDetailsConfig';

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
  /** Month label (e.g. "April") — for display only. */
  month: string;
  /** Stable DueFee row ID — sent to the create-refund API. */
  dueFeeId: string;
  sourceAllocationId?: string;
  sourceReceiptId?: string;
  receiptNumber?: string;
  amount: number | string;
}

export const refundAllocationLabel = (
  month: string,
  year: number,
  receiptNumber: string,
  allocationId: string,
  repeated: boolean
): string =>
  `${month} ${year}${receiptNumber ? ` · ${receiptNumber}` : ''}${
    repeated ? ` · allocation ${allocationId.slice(0, 8)}` : ''
  }`;

export interface IFeeHeadRefundItem {
  feeHeadId: string;
  months: IFeeHeadMonthRefund[];
}

/** Shape sent to POST /api/fee-refunds and PUT /api/fee-refunds/{id} */
export interface IFeeRefundApiPayload {
  idempotencyKey?: string;
  replacesRefundRequestId?: string;
  studentId: string;
  academicYearId: string;
  originalReceiptId: string;
  lines: { dueFeeId: string; sourceAllocationId: string; amount: number }[];
  refundMethod: string;
  reason: string;
  paymentDetails?: Record<string, unknown>;
}

/** Legacy in-form shape kept for backward compat with other consumers */
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
  refundType: string;
}

// ─── Build API payload from formik values ────────────────────────────────────

export const buildFeeRefundApiPayload = (
  values: IRefundFormValues,
  academicYearId: string
): IFeeRefundApiPayload => {
  const selected = (values.feeHeadRefunds || []).flatMap((fh) =>
    fh.months.filter((m) => Number(m.amount) > 0 && m.dueFeeId && m.sourceAllocationId)
  );
  return {
    studentId: values.studentId,
    academicYearId,
    originalReceiptId: selected[0]?.sourceReceiptId || '',
    refundMethod: values.refundMethod,
    reason: values.notes,
    paymentDetails: Object.fromEntries(
      Object.entries(values.paymentDetails || {}).map(([k, v]) => [
        k,
        dayjs.isDayjs(v) ? dateConvertor(v.format(dateFormat) || '') || '' : v,
      ])
    ),
    lines: selected.map((m) => ({
      dueFeeId: m.dueFeeId,
      sourceAllocationId: m.sourceAllocationId || '',
      amount: Number(m.amount),
    })),
  };
};

// Legacy helper kept for backward compat
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
): IRefundFormValues => {
  const method = editData?.refundMethod || '';
  const initialDetails = getInitialRefundPaymentDetails(method);
  const editDetails = editData?.paymentDetails || {};

  // Convert date fields to dayjs objects
  const mergedDetails = { ...initialDetails, ...editDetails };
  const configFields =
    refundPaymentMethodsConfig[method as keyof typeof refundPaymentMethodsConfig] || [];
  configFields.forEach((field) => {
    if (field.type === 'date' && mergedDetails[field.name]) {
      mergedDetails[field.name] = dayjs(mergedDetails[field.name]);
    }
  });

  return {
    boardId: editData?.boardId || '',
    mediumId: editData?.mediumId || '',
    standardId: editData?.standardId || '',
    divisionId: editData?.divisionId || '',
    studentId: editData?.studentId || '',
    studentName: editData?.studentName || '',
    refundMethod: method,
    notes: editData?.notes || '',
    paymentDetails: mergedDetails,
    // Array of { feeHeadId, months: { month, amount }[] } — populated when student is selected
    feeHeadRefunds: (editData?.feeHeadRefunds || []) as IFeeHeadRefundItem[],
    refundType: 'full',
  };
};

// ─── Validation Schema ────────────────────────────────────────────────────────

export const buildRefundValidationSchema = (currentYear: ICurrentYear) =>
  Yup.object({
    boardId: Yup.string().required('Board is required'),
    mediumId: Yup.string().required('Medium is required'),
    standardId: Yup.string().required('Class is required'),
    divisionId: Yup.string().required('Division is required'),
    studentId: Yup.string().required('Student is required'),
    refundType: Yup.string().required('Refund Type is required'),
    refundMethod: Yup.string().required('Select a refund method'),
    notes: Yup.string(),
    feeHeadRefunds: Yup.mixed()
      .test('at-least-one-refund', 'Enter a refund amount for at least one month', (value) => {
        if (!Array.isArray(value)) return false;
        const refunds = value as IFeeHeadRefundItem[];
        return refunds.some((fh) => fh.months.some((m) => Number(m.amount) > 0));
      })
      .test('single-receipt', 'Select refund lines from one original receipt only', (value) => {
        if (!Array.isArray(value)) return false;
        const ids = new Set(
          (value as IFeeHeadRefundItem[]).flatMap((x) =>
            x.months.map((m) => m.sourceReceiptId).filter(Boolean)
          )
        );
        return ids.size <= 1;
      }),
    paymentDetails: Yup.object().when(['refundMethod'], ([refundMethod], schema, context) => {
      if (
        !refundMethod ||
        !refundPaymentMethodsConfig[refundMethod as keyof typeof refundPaymentMethodsConfig]
      )
        return schema;

      return Yup.object(
        Object.fromEntries(
          refundPaymentMethodsConfig[refundMethod as keyof typeof refundPaymentMethodsConfig]
            // 'amount' is filtered from the refund UI (captured via the fee-head table instead),
            // so skip its validation here to avoid an invisible required-field blocker.
            .filter((field) => isRefundRequestField(field.name))
            .map((field) => [field.name, buildFieldValidation(field, currentYear, context?.parent)])
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
