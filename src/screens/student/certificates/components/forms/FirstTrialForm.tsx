import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import React, { forwardRef, useImperativeHandle } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';

import type { FormRef } from './BonafideForm';
import type { SelectedStudent } from '../StudentSearchPanel';

const TRIAL_OPTIONS = [
  { name: 'First Trial', id: 'first' },
  { name: 'Second Trial', id: 'second' },
  { name: 'Third Trial', id: 'third' },
];

interface FirstTrialFormProps {
  student: SelectedStudent;
  certNo: string;
  onSuccess: () => void;
}

const FirstTrialForm = forwardRef<FormRef, FirstTrialFormProps>(
  ({ student, certNo, onSuccess }, ref) => {
    const { values, touched, errors, handleChange, setFieldValue, handleSubmit } = useFormik({
      initialValues: {
        examYear: dayjs(),
        examCenter: '',
        seatNumber: '',
        subject: '',
        lastExamName: '',
        remarks: '',
      },
      validationSchema: Yup.object({
        examYear: Yup.mixed().nullable().required('Exam year is required'),
        examCenter: Yup.string().required('Exam center is required'),
        seatNumber: Yup.string()
          .required('Seat number is required')
          .matches(/^[0-9]+$/, 'Must be digits only'),
        lastExamName: Yup.string().required('Last exam name is required'),
        remarks: Yup.string().required('Remarks are required'),
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
            bgcolor: 'action.selected',
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: 700,
            color: 'warning.dark',
            letterSpacing: 1,
          }}
        >
          📝 {certNo}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.examYear && errors.examYear)}>
              <DatePicker
                label="Exam Year *"
                value={values.examYear}
                format="YYYY"
                views={['year']}
                onChange={(v) => setFieldValue('examYear', v)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: !!(touched.examYear && errors.examYear),
                    helperText: (touched.examYear && errors.examYear) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.examCenter && errors.examCenter)}>
              <TextField
                size="small"
                label="Exam Center *"
                name="examCenter"
                value={values.examCenter}
                onChange={handleChange}
                fullWidth
                error={!!(touched.examCenter && errors.examCenter)}
                helperText={(touched.examCenter && errors.examCenter) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.seatNumber && errors.seatNumber)}>
              <TextField
                size="small"
                label="Seat Number *"
                name="seatNumber"
                value={values.seatNumber}
                onChange={handleChange}
                fullWidth
                error={!!(touched.seatNumber && errors.seatNumber)}
                helperText={(touched.seatNumber && errors.seatNumber) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.subject && errors.subject)}>
              <CustomSelect
                options={TRIAL_OPTIONS}
                label="Subject / Trial"
                value={values.subject}
                onChange={(val) => setFieldValue('subject', val)}
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                error={!!(touched.subject && errors.subject)}
                helperText={(touched.subject && errors.subject) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.lastExamName && errors.lastExamName)}>
              <TextField
                size="small"
                label="Last Exam Name *"
                name="lastExamName"
                value={values.lastExamName}
                onChange={handleChange}
                fullWidth
                error={!!(touched.lastExamName && errors.lastExamName)}
                helperText={(touched.lastExamName && errors.lastExamName) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.remarks && errors.remarks)}>
              <TextField
                size="small"
                label="Remarks *"
                name="remarks"
                value={values.remarks}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
                error={!!(touched.remarks && errors.remarks)}
                helperText={(touched.remarks && errors.remarks) as string}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Box>
    );
  }
);

FirstTrialForm.displayName = 'FirstTrialForm';
export default FirstTrialForm;
