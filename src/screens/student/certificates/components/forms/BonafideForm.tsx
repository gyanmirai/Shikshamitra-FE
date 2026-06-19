import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField } from '@mui/material';
import React, { forwardRef, useImperativeHandle } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';

import type { SelectedStudent } from '../StudentSearchPanel';

export interface FormRef {
  submit: () => void;
  values: any;
}

interface BonafideFormProps {
  student: SelectedStudent;
  certNo: string;
  onSuccess: () => void;
}

const BonafideForm = forwardRef<FormRef, BonafideFormProps>(
  ({ student, certNo, onSuccess }, ref) => {
    const { values, touched, errors, handleChange, setFieldValue, handleSubmit } = useFormik({
      initialValues: {
        issueDate: dayjs(),
        reason: '',
      },
      validationSchema: Yup.object({
        issueDate: Yup.mixed().nullable().required('Issue date is required'),
        reason: Yup.string().required('Reason is required'),
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
        {/* Read-only cert number */}
        <Box
          sx={{
            mb: 2,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            bgcolor: 'action.selected',
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: 700,
            color: 'primary.main',
            letterSpacing: 1,
          }}
        >
          📄 {certNo}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.issueDate && errors.issueDate)}>
              <DatePicker
                label="Issue Date *"
                value={values.issueDate}
                onChange={(v) => setFieldValue('issueDate', v)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: !!(touched.issueDate && errors.issueDate),
                    helperText: (touched.issueDate && errors.issueDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.reason && errors.reason)}>
              <TextField
                size="small"
                label="Reason *"
                name="reason"
                value={values.reason}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                placeholder="e.g., Bank account opening, Scholarship application…"
                error={!!(touched.reason && errors.reason)}
                helperText={(touched.reason && errors.reason) as string}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Box>
    );
  }
);

BonafideForm.displayName = 'BonafideForm';
export default BonafideForm;
