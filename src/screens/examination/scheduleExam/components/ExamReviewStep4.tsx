import type { FormikProps } from 'formik';

import React from 'react';
import { Box } from '@mui/material';

import ExamBasicReview from './ExamBasicReview';
import ExamScheduleReview from './ExamScheduleReview';
import ExamReadinessPanel from './ExamReadinessPanel';
import RoomAllocationReview from './RoomAllocationReview';

import type { IExamFormValues } from '../type';

const ExamReviewStep4 = (
  props: FormikProps<IExamFormValues> & { onEditStep?: (step: number) => void }
) => {
  // Destructure formik props from the component props
  const formik = props;
  const { onEditStep } = props;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ExamBasicReview formik={formik} onEdit={onEditStep ? () => onEditStep(0) : undefined} />
      <ExamScheduleReview formik={formik} onEdit={onEditStep ? () => onEditStep(1) : undefined} />
      <RoomAllocationReview formik={formik} onEdit={onEditStep ? () => onEditStep(2) : undefined} />
      <ExamReadinessPanel values={formik.values} onEditStep={onEditStep} />
    </Box>
  );
};

export default ExamReviewStep4;
