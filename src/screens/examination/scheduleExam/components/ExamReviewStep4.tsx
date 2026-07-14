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
    <Box>
      <ExamReadinessPanel values={formik.values} onEditStep={onEditStep} />
      {/* NON-BREAKING: onEdit callbacks navigate back to each respective step */}
      <ExamBasicReview formik={formik} onEdit={onEditStep ? () => onEditStep(0) : undefined} />
      <ExamScheduleReview formik={formik} onEdit={onEditStep ? () => onEditStep(1) : undefined} />
      <RoomAllocationReview formik={formik} onEdit={onEditStep ? () => onEditStep(2) : undefined} />
    </Box>
  );
};

export default ExamReviewStep4;
