import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField } from '@mui/material';
import React, { forwardRef, useImperativeHandle } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';

import type { FormRef } from './BonafideForm';
import type { SelectedStudent } from '../StudentSearchPanel';

interface LeavingFormProps {
  student: SelectedStudent;
  certNo: string;
  onSuccess: () => void;
}

const LeavingForm = forwardRef<FormRef, LeavingFormProps>(({ student, certNo, onSuccess }, ref) => {
  const { values, touched, errors, handleChange, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      lcNumber: certNo,
      lcDate: dayjs(),
      leavingReason: '',
    },
    validationSchema: Yup.object({
      lcNumber: Yup.string().required('LC Number is required'),
      lcDate: Yup.mixed().nullable().required('LC Date is required'),
      leavingReason: Yup.string().required('Leaving reason is required'),
    }),
    onSubmit: () => {
      onSuccess();
    },
  });

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(),
    values,
  }));

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          bgcolor: 'background.neutral',
          border: (t) => `1px solid ${t.palette.divider}`,
          fontFamily: 'monospace',
          fontSize: 13,
          fontWeight: 700,
          color: 'text.secondary',
          letterSpacing: 1,
        }}
      >
        Certificate No: {certNo}
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(touched.lcNumber && errors.lcNumber)}>
            <TextField
              size="small"
              label="LC Number *"
              name="lcNumber"
              value={values.lcNumber}
              onChange={handleChange}
              fullWidth
              inputProps={{ readOnly: true }}
              error={!!(touched.lcNumber && errors.lcNumber)}
              helperText={(touched.lcNumber && errors.lcNumber) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(touched.lcDate && errors.lcDate)}>
            <DatePicker
              label="LC Date *"
              value={values.lcDate}
              format="DD-MM-YYYY"
              onChange={(v) => setFieldValue('lcDate', v)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: !!(touched.lcDate && errors.lcDate),
                  helperText: (touched.lcDate && errors.lcDate) as string,
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(touched.leavingReason && errors.leavingReason)}>
            <TextField
              size="small"
              label="Leaving Reason *"
              name="leavingReason"
              value={values.leavingReason}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              placeholder="e.g., Transfer to another city, Family relocation…"
              error={!!(touched.leavingReason && errors.leavingReason)}
              helperText={(touched.leavingReason && errors.leavingReason) as string}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </Box>
  );
});

LeavingForm.displayName = 'LeavingForm';
export default LeavingForm;
