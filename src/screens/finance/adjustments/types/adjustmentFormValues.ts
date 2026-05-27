import * as Yup from 'yup';

import type { IFeeHeadRefundItem } from '../../feeRefund/NewRefundForm/initialValuesAndValidation';

// ── Full formik shape for the AdjustmentForm ────────────────────────────────

export interface IAdjustmentFullFormValues {
  // General Info
  boardId: string;
  mediumId: string;
  standardId: string;
  divisionId: string;
  studentId: string;
  studentName: string;
  feeHeadRefunds: IFeeHeadRefundItem[];
  // Adjustment Details
  adjustmentType: string;
  reason: string;
}

export const buildAdjustmentInitialValues = (): IAdjustmentFullFormValues => ({
  boardId: '',
  mediumId: '',
  standardId: '',
  divisionId: '',
  studentId: '',
  studentName: '',
  feeHeadRefunds: [],
  adjustmentType: '',
  reason: '',
});

export const buildAdjustmentValidationSchema = () =>
  Yup.object({
    boardId: Yup.string().required('Board is required'),
    mediumId: Yup.string().required('Medium is required'),
    standardId: Yup.string().required('Standard is required'),
    divisionId: Yup.string().required('Division is required'),
    studentId: Yup.string().required('Student is required'),
    adjustmentType: Yup.string().required('Adjustment type is required'),
    reason: Yup.string()
      .required('Reason is required')
      .min(5, 'Reason must be at least 5 characters'),
  });
