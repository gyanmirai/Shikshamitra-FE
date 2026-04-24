'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { sliderClasses } from '@mui/material/Slider';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { ComponentBlock } from 'src/components/component-block';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Slider, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IUpdateProgressProps } from '../type';

const marks = [
  { value: 0, label: '0' },
  { value: 20, label: '20' },
  { value: 40, label: '40' },
  { value: 60, label: '60' },
  { value: 80, label: '80' },
  { value: 100, label: '100' },
];

const UpdateProgress: React.FC<IUpdateProgressProps> = ({ onClose }) => {
  const formik = useFormik({
    initialValues: {
      completePercentage: 0,
      description: '',
    },
    validationSchema: Yup.object({
      completePercentage: Yup.number()
        .min(0, 'Percentage cannot be negative')
        .max(100, 'Percentage cannot exceed 100')
        .required('Complete Percentage is required'),
    }),
    onSubmit: () => {},
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box component="form" flexDirection="column" onSubmit={formik.handleSubmit} p={2} gap={3}>
        <ShakingTextField
          error={!!(formik.touched.completePercentage && formik.errors.completePercentage) || false}
        >
          <ComponentBlock>
            <Slider
              defaultValue={20}
              onChange={(_event, value) => {
                formik.setFieldValue('completePercentage', value);
              }}
              getAriaValueText={(value) => `${value}%`}
              step={2}
              valueLabelDisplay="auto"
              marks={marks}
              sx={{ [`& .${sliderClasses.mark}[data-index="3"]`]: { display: 'none' } }}
            />
          </ComponentBlock>
        </ShakingTextField>

        <TextField
          fullWidth
          multiline
          rows={4}
          name="description"
          label="Description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={!!(formik.touched.description && formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />

        <DialogActions sx={{ flexShrink: 0, p: 2 }}>
          <CancelButton
            onClick={() => {
              onClose(null, false);
            }}
          />
          <SubmitButton onClick={() => {}} />
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

export default UpdateProgress;
