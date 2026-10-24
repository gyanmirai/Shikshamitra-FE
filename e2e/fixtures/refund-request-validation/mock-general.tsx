import React from 'react';
import { Button, Typography } from '@mui/material';

export default function TestStudent({ formik }: any) {
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
            studentId: 'student',
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
