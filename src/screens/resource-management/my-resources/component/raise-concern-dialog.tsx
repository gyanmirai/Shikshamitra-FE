'use client';

import React from 'react';
import { useFormik } from 'formik';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Typography, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getMyResourceInitialValues } from '../initialValue';
import { raisedConcernValidationSchema } from '../validationSchema';

import type { IRaiseConcernDialogProps } from '../my-resources-interface';

const RaisedConcernForResourcesDialog: React.FC<IRaiseConcernDialogProps> = ({ onClose, data }) => {
  const formik = useFormik({
    initialValues: getMyResourceInitialValues(data),
    validationSchema: raisedConcernValidationSchema,
    onSubmit: (values) => {},
  });

  //   const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '100%', bgcolor: 'background.neutral' }}>
          <Grid container spacing={2}>
            {/* Name */}
            {/* <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
                                    <TextField
                                disabled
                                        fullWidth
                                        size="small"
                                        label="Resource Name *"
                                        value={formik.values.name}
                                        onChange={(e) => formik.setFieldValue('name', e.target.value)}
                                        error={formik.touched.name && Boolean(formik.errors.name)}
                                        helperText={formik.touched.name && formik.errors.name || ''}
                                    />
                                </ShakingTextField>
                            </Grid>

                          
                            <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.vendor && Boolean(formik.errors.vendor)}>
                                    <TextField
                                     disabled
                                        fullWidth
                                        size="small"
                                        label="Vendor *"
                                        value={formik.values.vendor}
                                        onChange={(e) => formik.setFieldValue('vendor', e.target.value)}
                                        error={formik.touched.vendor && Boolean(formik.errors.vendor)}
                                        helperText={formik.touched.vendor && formik.errors.vendor || ''}
                                    />
                                </ShakingTextField>
                            </Grid>

                       
                            <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.category && Boolean(formik.errors.category)}>
                                    <CustomSelect
                                     disabled
                                        label="Select Category *"
                                        options={[]} // Fill options
                                        value={formik.values.category}
                                        onChange={(value) => formik.setFieldValue('category', value)}
                                        error={formik.touched.category && Boolean(formik.errors.category)}
                                        helperText={formik.touched.category && formik.errors.category || ''}
                                    />
                                </ShakingTextField>
                            </Grid>

                            
                            <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}>
                                    <CustomSelect
                                     disabled
                                        label="Select Sub-Category *"
                                        options={[]} // Fill options
                                        value={formik.values.subCategory}
                                        onChange={(value) => formik.setFieldValue('subCategory', value)}
                                        error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
                                        helperText={formik.touched.subCategory && formik.errors.subCategory || ''}
                                    />
                                </ShakingTextField>
                            </Grid>

                            
                            <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.condition && Boolean(formik.errors.condition)}>
                                    <CustomSelect
                                        disabled
                                        label="Condition *"
                                        options={[
                                            { label: 'New', value: 'New' },
                                            { label: 'Used', value: 'Used' },
                                            { label: 'Damaged', value: 'Damaged' },
                                        ]}
                                        value={formik.values.condition}
                                        onChange={(value) => formik.setFieldValue('condition', value)}
                                        error={formik.touched.condition && Boolean(formik.errors.condition)}
                                        helperText={formik.touched.condition && formik.errors.condition || ''}
                                    />
                                </ShakingTextField>
                            </Grid>

                       
                            <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.status && Boolean(formik.errors.status)}>
                                    <CustomSelect
                                     disabled
                                        label="Status *"
                                        options={[
                                            { label: 'Available', value: 'Available' },
                                            { label: 'In Use', value: 'In Use' },
                                            { label: 'Under Repair', value: 'Under Repair' },
                                        ]}
                                        value={formik.values.status}
                                        onChange={(value) => formik.setFieldValue('status', value)}
                                        error={formik.touched.status && Boolean(formik.errors.status)}
                                        helperText={formik.touched.status && formik.errors.status || ''}
                                    />
                                </ShakingTextField>
                            </Grid>

                           
                            <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.quantity && Boolean(formik.errors.quantity)}>
                                    <TextField
                                     disabled
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Quantity *"
                                        value={formik.values.quantity}
                                        onChange={(e) => formik.setFieldValue('quantity', Number(e.target.value))}
                                        error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                        helperText={formik.touched.quantity && formik.errors.quantity || ''}
                                    />
                                </ShakingTextField>
                            </Grid>

                           
                            <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.measurementUnit && Boolean(formik.errors.measurementUnit)}>
                                    <CustomSelect
                                     disabled
                                        label="Measurement Unit *"
                                        options={[]} // Fill options
                                        value={formik.values.measurementUnit}
                                        onChange={(value) => formik.setFieldValue('measurementUnit', value)}
                                        error={formik.touched.measurementUnit && Boolean(formik.errors.measurementUnit)}
                                        helperText={formik.touched.measurementUnit && formik.errors.measurementUnit || ''}
                                    />
                                </ShakingTextField>
                            </Grid>

                           
                            <Grid size={6} pb="10px">
                                <ShakingTextField error={formik.touched.assignedDate && Boolean(formik.errors.assignedDate)}>
                                    <DatePicker
                                        label="Assigned Date"
                                        format="DD-MM-YYYY"
                                        value={formik.values.assignedDate ? dayjs(formik.values.assignedDate) : null}
                                        onChange={(value) => formik.setFieldValue('assignedDate', value)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true,
                                                error: formik.touched.assignedDate && Boolean(formik.errors.assignedDate),
                                                helperText: formik.touched.assignedDate && formik.errors.assignedDate || '',
                                            },
                                        }}
                                    />
                                </ShakingTextField>
                            </Grid>
                            
                            <Grid size={12} pb="10px">
                                <ShakingTextField error={formik.touched.description && Boolean(formik.errors.description)}>
                                    <Editor
                                        onChange={(value) => formik.setFieldValue('description', value)}
                                        value={formik.values.description}
                                        placeholder="Description *"
                                        error={formik.touched.description && Boolean(formik.errors.description)}
                                        helperText={formik.touched.description && formik.errors.description || ''}
                                        editable
                                        sx={{ height: '100%' }}
                                    />
                                </ShakingTextField>
                            </Grid>
                            
                            */}

            {/* Priority (Optional) */}
            <Grid size={6} pb="10px">
              <ShakingTextField error={formik.touched.priority && Boolean(formik.errors.priority)}>
                <CustomSelect
                  label="Priority"
                  options={[
                    { label: 'High', value: 'High' },
                    { label: 'Medium', value: 'Medium' },
                    { label: 'Low', value: 'Low' },
                  ]}
                  value={formik?.values?.priority ?? ''}
                  onChange={(value) => formik.setFieldValue('priority', value)}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  helperText={(formik.touched.priority && formik.errors.priority) || ''}
                />
              </ShakingTextField>
            </Grid>

            {/* Issue Description */}
            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.issueDescription && Boolean(formik.errors.issueDescription)}
              >
                <Editor
                  onChange={(value) => formik.setFieldValue('issueDescription', value)}
                  value={formik.values.issueDescription}
                  placeholder="Issue Description"
                  error={formik.touched.issueDescription && Boolean(formik.errors.issueDescription)}
                  helperText={
                    (formik.touched.issueDescription && formik.errors.issueDescription) || ''
                  }
                  editable
                  sx={{ height: '100%' }}
                />
              </ShakingTextField>
            </Grid>

            {/* Upload (Image or Supporting Doc) */}
            <Grid size={12} sx={{ pb: '10px' }}>
              <UploadBox
                onDrop={() => {}} // implement file handler
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
                    <Typography variant="body2">Drag your image or document here</Typography>
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
      </form>
    </BackPopUpChecked>
  );
};

export default RaisedConcernForResourcesDialog;
