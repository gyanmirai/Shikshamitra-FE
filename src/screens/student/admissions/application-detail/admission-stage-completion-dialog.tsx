'use client';

import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import {
  EntranceExamCompletionFields,
  PhysicalFormCompletionFields,
} from './admission-stage-completion-fields';
import {
  getStageCompletionKind,
  isPassingEntranceExamResult,
  buildEntranceExamCompletionReason,
  buildPhysicalFormCompletionReason,
} from './admission-stage-completion';

import type { StageCompletionFormValues } from './admission-stage-completion';

type Props = {
  open: boolean;
  stage: AdmissionApplicationStage;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<boolean>;
};

const examSchema = Yup.object({
  scheduledAt: Yup.string().required('Exam date and time are required'),
  totalMarks: Yup.number().min(1).max(1000).required('Total marks are required'),
  passingMarks: Yup.number()
    .min(0)
    .max(Yup.ref('totalMarks'), 'Pass marks cannot exceed total marks')
    .required('Pass marks are required'),
  obtainedMarks: Yup.number()
    .min(Yup.ref('passingMarks'), 'The candidate must pass before this stage can complete')
    .max(Yup.ref('totalMarks'), 'Obtained marks cannot exceed total marks')
    .required('Obtained marks are required'),
});

const physicalFormSchema = Yup.object({
  issued: Yup.boolean().oneOf([true], 'Confirm that the registration form was issued'),
  formReference: Yup.string().trim().max(80, 'Use 80 characters or fewer'),
});

export function AdmissionStageCompletionDialog({ open, stage, loading, onClose, onSubmit }: Props) {
  const kind = getStageCompletionKind(stage);
  const isExam = kind === 'entrance-exam';
  const scheduledAtInputRef = useRef<HTMLInputElement>(null);
  const formik = useFormik<StageCompletionFormValues>({
    initialValues: {
      scheduledAt: '',
      totalMarks: 100,
      passingMarks: 40,
      obtainedMarks: 0,
      issued: false,
      formReference: '',
    },
    validationSchema: isExam ? examSchema : physicalFormSchema,
    onSubmit: async (values, helpers) => {
      const reason = isExam
        ? buildEntranceExamCompletionReason(values)
        : buildPhysicalFormCompletionReason(values.formReference);
      const completed = await onSubmit(reason);
      if (!completed) return;
      helpers.resetForm();
      onClose();
    },
  });
  const passed = isPassingEntranceExamResult(formik.values);
  const submitStageCompletion = async () => {
    if (isExam && scheduledAtInputRef.current) {
      await formik.setFieldValue('scheduledAt', scheduledAtInputRef.current.value, false);
    }
    await formik.submitForm();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={isExam ? 'Record entrance exam result' : 'Confirm physical form issue'}
      maxWidth="sm"
    >
      <DialogScrollContent onSubmit={() => submitStageCompletion().catch(() => undefined)}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isExam
            ? 'Record the schedule and marks. Only a passing result can move the application forward.'
            : 'Confirm that the school issued the physical registration form before moving forward.'}
        </Typography>
        {isExam ? (
          <EntranceExamCompletionFields
            formik={formik}
            passed={passed}
            scheduledAtInputRef={scheduledAtInputRef}
          />
        ) : (
          <PhysicalFormCompletionFields formik={formik} />
        )}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:close" />}
          disabled={loading}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="small"
          loading={loading}
          startIcon={
            <Iconify icon={isExam ? 'mdi:clipboard-check-outline' : 'mdi:file-check-outline'} />
          }
          onClick={() => submitStageCompletion().catch(() => undefined)}
        >
          {isExam ? 'Record pass and continue' : 'Confirm issue and continue'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
