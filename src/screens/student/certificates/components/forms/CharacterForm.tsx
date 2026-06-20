import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField } from '@mui/material';
import React, { forwardRef, useImperativeHandle } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';

import type { FormRef } from './BonafideForm';
import type { SelectedStudent } from '../StudentSearchPanel';

interface CharacterFormProps {
  student: SelectedStudent;
  certNo: string;
  onSuccess: () => void;
}

const CharacterForm = forwardRef<FormRef, CharacterFormProps>(
  ({ student, certNo, onSuccess }, ref) => {
    const { values, touched, errors, handleChange, setFieldValue, handleSubmit } = useFormik({
      initialValues: {
        issueDate: dayjs(),
        characterRemarks: '',
      },
      validationSchema: Yup.object({
        issueDate: Yup.mixed().nullable().required('Issue date is required'),
        characterRemarks: Yup.string().required('Character remarks are required'),
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
            <ShakingTextField error={!!(touched.characterRemarks && errors.characterRemarks)}>
              <TextField
                size="small"
                label="Character Remarks *"
                name="characterRemarks"
                value={values.characterRemarks}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                placeholder="e.g., The student has been of good character and conduct…"
                error={!!(touched.characterRemarks && errors.characterRemarks)}
                helperText={(touched.characterRemarks && errors.characterRemarks) as string}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Box>
    );
  }
);

CharacterForm.displayName = 'CharacterForm';
export default CharacterForm;
