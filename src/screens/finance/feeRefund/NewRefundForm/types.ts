import type { FormikProps } from 'formik';
import type { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import type { IRefundFormValues } from './initialValuesAndValidation';

// ─── Formik instance type ─────────────────────────────────────────────────────

export type RefundFormik = FormikProps<IRefundFormValues>;

// ─── Fee head payment data (API response shape) ───────────────────────────────

export interface IMonthItem {
  month: string;
  total: number;
  paid: number;
  refunded: number;
  status: FeeCollectionStatusType;
}

export interface IFeeHeadPayment {
  feeHeadId: string;
  feeHeadName: string;
  items: IMonthItem[];
}
