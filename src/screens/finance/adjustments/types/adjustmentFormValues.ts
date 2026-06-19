import * as Yup from 'yup';

import type { CreateFeeAdjustmentDto } from './adjustmentApi.types';
import type { IFeeHeadRefundItem } from '../../feeRefund/NewRefundForm/initialValuesAndValidation';

export interface IAdjustmentFullFormValues {
  boardId: string;
  mediumId: string;
  standardId: string;
  divisionId: string;
  studentId: string | number;
  studentName: string;
  feeHeadRefunds: IFeeHeadRefundItem[];
  remarks: string;
}

export const buildAdjustmentInitialValues = (
  initials?: Partial<IAdjustmentFullFormValues>
): IAdjustmentFullFormValues => ({
  boardId: initials?.boardId || '',
  mediumId: initials?.mediumId || '',
  standardId: initials?.standardId || '',
  divisionId: initials?.divisionId || '',
  studentId: initials?.studentId || '',
  studentName: initials?.studentName || '',
  feeHeadRefunds: initials?.feeHeadRefunds || [],
  remarks: initials?.remarks || '',
});

export const buildAdjustmentValidationSchema = (hideStudentInfoForm = false) =>
  Yup.object({
    boardId: hideStudentInfoForm ? Yup.string() : Yup.string().required('Board is required'),
    mediumId: hideStudentInfoForm ? Yup.string() : Yup.string().required('Medium is required'),
    standardId: hideStudentInfoForm ? Yup.string() : Yup.string().required('Standard is required'),
    divisionId: hideStudentInfoForm ? Yup.string() : Yup.string().required('Division is required'),
    studentId: Yup.string().required('Student is required'),
    // adjustmentType: Yup.number().required('Adjustment type is required'),
    remarks: Yup.string()
      .required('Remarks is required')
      .min(5, 'Remarks must be at least 5 characters'),
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
  reason: values.remarks,
  remarks: values.remarks || undefined,
  sourceLines: (values.feeHeadRefunds || []).flatMap((fh) =>
    fh.months
      .filter((m) => Number(m.amount) > 0 && m.dueFeeId)
      .map((m) => ({ dueFeeId: m.dueFeeId!, amount: Number(m.amount) }))
  ),
});
