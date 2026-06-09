import type { FormikProps } from 'formik';
import type { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import type { IRefundFormValues } from './initialValuesAndValidation';

// ─── Formik instance type ─────────────────────────────────────────────────────

export type RefundFormik = FormikProps<IRefundFormValues>;

// ─── Fee head payment data (API response shape) ───────────────────────────────

export interface IMonthItem {
  /** Stable DueFee row ID — used as the line key in the create-refund API request. */
  dueFeeId: string;
  month: string;
  year: number;
  total: number;
  paid: number;
  refunded: number;
  refundable: number;
  concession?: number;
  status: FeeCollectionStatusType;
}

export interface IFeeHeadPayment {
  feeHeadId: string;
  feeHeadName: string;
  items: IMonthItem[];
}
