import type { FormikProps } from 'formik';

import React from 'react';

import { Box } from '@mui/material';

import ExamBasicReview from './ExamBasicReview';
import ExamScheduleReview from './ExamScheduleReview';
import RoomAllocationReview from './RoomAllocationReview';

import type { IExamFormValues } from '../type';

const ExamReviewStep4 = (props: FormikProps<IExamFormValues>) => {
  // Destructure formik props from the component props
  const formik = props;
  return (
    <Box>
      <ExamBasicReview formik={formik} />
      <ExamScheduleReview formik={formik} />
      <RoomAllocationReview formik={formik} />
    </Box>
  );
};

export default ExamReviewStep4;
