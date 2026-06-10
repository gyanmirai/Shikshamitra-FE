import * as Yup from 'yup';

import type { AdjustmentType } from '../enums/adjustment.enum';
import type { CreateFeeAdjustmentDto } from './adjustmentApi.types';
import type { IFeeHeadRefundItem } from '../../feeRefund/NewRefundForm/initialValuesAndValidation';

export interface IAdjustmentFullFormValues {
  boardId: string;
  mediumId: string;
  standardId: string;
  divisionId: string;
  studentId: string;
  studentName: string;
  feeHeadRefunds: IFeeHeadRefundItem[];
  adjustmentType: AdjustmentType | '';
  reason: string;
  remarks?: string;
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
  remarks: '',
});

export const buildAdjustmentValidationSchema = () =>
  Yup.object({
    boardId: Yup.string().required('Board is required'),
    mediumId: Yup.string().required('Medium is required'),
    standardId: Yup.string().required('Standard is required'),
    divisionId: Yup.string().required('Division is required'),
    studentId: Yup.string().required('Student is required'),
    adjustmentType: Yup.number().required('Adjustment type is required'),
    reason: Yup.string()
      .required('Reason is required')
      .min(5, 'Reason must be at least 5 characters'),
    feeHeadRefunds: Yup.mixed().test(
      'at-least-one-adjustment',
      'Enter an adjustment amount for at least one month',
      (value) => {
        if (!Array.isArray(value)) return false;
        const items = value as IFeeHeadRefundItem[];
        return items.some((fh) =>
          fh.months.some((m) => Number(m.amount) > 0 && Boolean(m.dueFeeId))
        );
      }
    ),
  });

export const buildAdjustmentApiPayload = (
  values: IAdjustmentFullFormValues
): CreateFeeAdjustmentDto => ({
  studentId: values.studentId,
  adjustmentType: Number(values.adjustmentType),
  reason: values.reason,
  remarks: values.remarks || undefined,
  sourceLines: (values.feeHeadRefunds || []).flatMap((fh) =>
    fh.months
      .filter((m) => Number(m.amount) > 0 && m.dueFeeId)
      .map((m) => ({ dueFeeId: m.dueFeeId!, amount: Number(m.amount) }))
  ),
});
