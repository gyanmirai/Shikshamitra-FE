'use client';

import React from 'react';
import { useFormik } from 'formik';
import { Editor } from 'src/components/editor';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, TextField, Typography, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { initialRequestResourceValues } from '../initialValue';
import { requestResourceValidationSchema } from '../validationSchema';

import type { IRequestResourceFormProps } from '../my-resources-interface';

const NewResourcesRequestForm: React.FC<IRequestResourceFormProps> = ({ onClose }) => {
  const formik = useFormik({
    initialValues: initialRequestResourceValues,
    validationSchema: requestResourceValidationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  //   const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={2}>
              {/* Resource Name */}
              <Grid size={6} pb="10px">
                <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Resource Name *"
                    value={formik.values.name}
                    onChange={(e) => formik.setFieldValue('name', e.target.value)}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </ShakingTextField>
              </Grid>

              {/* Category */}
              <Grid size={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.category && Boolean(formik.errors.category)}
                >
                  <CustomSelect
                    label="Select Category *"
                    options={[]} // Replace with category options
                    value={formik.values.category}
                    onChange={(value) => formik.setFieldValue('category', value)}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    helperText={formik.touched.category ? formik.errors.category : undefined}
                  />
                </ShakingTextField>
              </Grid>

              {/* Sub Category */}
              <Grid size={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
                >
                  <CustomSelect
                    label="Select Sub-Category *"
                    options={[]} // Replace with sub-category options
                    value={formik.values.subCategory}
                    onChange={(value) => formik.setFieldValue('subCategory', value)}
                    error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
                    helperText={formik.touched.subCategory ? formik.errors.subCategory : undefined}
                  />
                </ShakingTextField>
              </Grid>
              {/* Quantity */}
              <Grid size={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Quantity *"
                    value={formik.values.quantity}
                    onChange={(e) => formik.setFieldValue('quantity', Number(e.target.value))}
                    error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                    helperText={formik.touched.quantity && formik.errors.quantity}
                  />
                </ShakingTextField>
              </Grid>

              {/* Measurement Unit */}
              <Grid size={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.measurementUnit && Boolean(formik.errors.measurementUnit)}
                >
                  <CustomSelect
                    label="Measurement Unit *"
                    options={[]} // Replace with units (e.g., Piece, Box)
                    value={formik.values.measurementUnit}
                    onChange={(value) => formik.setFieldValue('measurementUnit', value)}
                    error={formik.touched.measurementUnit && Boolean(formik.errors.measurementUnit)}
                    helperText={
                      formik.touched.measurementUnit ? formik.errors.measurementUnit : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Priority */}
              <Grid size={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                >
                  <CustomSelect
                    label="Priority *"
                    options={[
                      { label: 'High', value: 'High' },
                      { label: 'Medium', value: 'Medium' },
                      { label: 'Low', value: 'Low' },
                    ]}
                    value={formik.values.priority}
                    onChange={(value) => formik.setFieldValue('priority', value)}
                    error={formik.touched.priority && Boolean(formik.errors.priority)}
                    helperText={formik.touched.priority ? formik.errors.priority : undefined}
                  />
                </ShakingTextField>
              </Grid>

              {/* Required By Date */}
              <Grid size={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.requiredByDate && Boolean(formik.errors.requiredByDate)}
                >
                  <DatePicker
                    label="Required By Date *"
                    format="DD-MM-YYYY"
                    value={formik.values.requiredByDate}
                    onChange={(value) => formik.setFieldValue('requiredByDate', value)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error:
                          formik.touched.requiredByDate && Boolean(formik.errors.requiredByDate),
                        helperText:
                          formik.touched.requiredByDate && formik.errors.requiredByDate
                            ? String(formik.errors.requiredByDate)
                            : '',
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Description */}
              <Grid size={12} pb="10px">
                <ShakingTextField
                  error={formik.touched.description && Boolean(formik.errors.description)}
                >
                  <Editor
                    onChange={(value) => {
                      formik.setFieldValue('description', value);
                    }}
                    value={formik.values.description}
                    placeholder="Description *"
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    editable
                    sx={{ height: '100%' }}
                    slotProps={{
                      wrap: {
                        height: '100%',
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Upload (Optional) */}
              <Grid size={12} sx={{ pb: '10px' }}>
                <UploadBox
                  onDrop={() => {}}
                  placeholder={
                    <Box
                      sx={{
                        gap: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.disabled',
                        flexDirection: 'column',
                      }}
                    >
                      <Iconify icon="eva:cloud-upload-fill" width={40} />
                      <Typography variant="body2">Drag Your File</Typography>
                    </Box>
                  }
                  sx={{
                    py: 2.5,
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1.5,
                  }}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <CancelButton
              onClick={() => {
                onClose();
              }}
            />
            <SubmitButton onClick={() => {}} />
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default NewResourcesRequestForm;
