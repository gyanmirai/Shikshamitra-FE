import React from 'react';
import { Button, Typography } from '@mui/material';
import { getLiveContext } from './mock-api';

export default function TestStudent({ formik }: any) {
  const liveContext = getLiveContext();
  return (
    <>
      <Typography variant="body2">
        Synthetic student · GR 1001 · Board / Medium / Class / Division
      </Typography>
      <Button
        variant="outlined"
        onClick={() =>
          formik.setValues({
            ...formik.values,
            studentId: liveContext?.studentId ?? 'student',
            studentName: 'Synthetic Student',
            refundMethod: 'Cash',
            paymentDetails: { receivedBy: 'Synthetic Parent' },
            refundType: 'partial',
          })
        }
      >
        Load test student
      </Button>
    </>
  );
}
