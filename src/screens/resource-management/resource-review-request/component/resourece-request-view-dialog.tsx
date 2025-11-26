'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { Editor } from 'src/components/editor';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { Grid, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { adminReviewValidationSchema } from '../validationSchema';
import { getInitialResourceRequestReviewValues } from '../initialValue';

import type { IResourceRequestReviewDetailedViewProps } from '../resource-review-request-interface';

const ResourceRequestReviewDialog: React.FC<IResourceRequestReviewDetailedViewProps> = ({
  onClose,
  data,
  isEdit,
  requestStatusType,
}) => {
  const formik = useFormik({
    initialValues: getInitialResourceRequestReviewValues(data),
    validationSchema: adminReviewValidationSchema,
    onSubmit: (values) => {},
  });

  const isDisabled = data !== null && isEdit === false;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '100%', bgcolor: 'background.neutral' }}>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid size={6} pb="10px">
              <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
                <TextField
                  disabled
                  fullWidth
                  size="small"
                  label="Resource Name *"
                  value={formik.values.name}
                  onChange={(e) => formik.setFieldValue('name', e.target.value)}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={(formik.touched.name && formik.errors.name) || ''}
                />
              </ShakingTextField>
            </Grid>
            {requestStatusType !== 'New' && (
              <Grid size={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.assignedDate && Boolean(formik.errors.assignedDate)}
                >
                  <DatePicker
                    disabled
                    label="Resource Assigned Date"
                    format="DD-MM-YYYY"
                    value={formik.values.assignedDate ? dayjs(formik.values.assignedDate) : null}
                    onChange={(value) => formik.setFieldValue('assignedDate', value)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.assignedDate && Boolean(formik.errors.assignedDate),
                        helperText:
                          (formik.touched.assignedDate && formik.errors.assignedDate) || '',
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {/* <Grid size={6} pb="10px">
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
                        </Grid> */}

            <Grid size={6} pb="10px">
              <ShakingTextField error={formik.touched.category && Boolean(formik.errors.category)}>
                <CustomSelect
                  disabled
                  label="Select Category *"
                  options={[]} // Fill options
                  value={formik.values.category}
                  onChange={(value) => formik.setFieldValue('category', value)}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={(formik.touched.category && formik.errors.category) || ''}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
              >
                <CustomSelect
                  disabled
                  label="Select Sub-Category *"
                  options={[]} // Fill options
                  value={formik.values.subCategory}
                  onChange={(value) => formik.setFieldValue('subCategory', value)}
                  error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
                  helperText={(formik.touched.subCategory && formik.errors.subCategory) || ''}
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
                  helperText={(formik.touched.quantity && formik.errors.quantity) || ''}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.measurementUnit && Boolean(formik.errors.measurementUnit)}
              >
                <CustomSelect
                  disabled
                  label="Measurement Unit *"
                  options={[]} // Fill options
                  value={formik.values.measurementUnit}
                  onChange={(value) => formik.setFieldValue('measurementUnit', value)}
                  error={formik.touched.measurementUnit && Boolean(formik.errors.measurementUnit)}
                  helperText={
                    (formik.touched.measurementUnit && formik.errors.measurementUnit) || ''
                  }
                />
              </ShakingTextField>
            </Grid>

            {/* Priority (Optional) */}
            <Grid size={6} pb="10px">
              <ShakingTextField error={formik.touched.priority && Boolean(formik.errors.priority)}>
                <CustomSelect
                  disabled={isDisabled}
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

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.requiredByDate && Boolean(formik.errors.requiredByDate)}
              >
                <DatePicker
                  disabled={isDisabled}
                  label="Required By Date"
                  format="DD-MM-YYYY"
                  value={formik.values.requiredByDate ? dayjs(formik.values.requiredByDate) : null}
                  onChange={(value) => formik.setFieldValue('requiredByDate', value)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.requiredByDate && Boolean(formik.errors.requiredByDate),
                      helperText:
                        (formik.touched.requiredByDate && formik.errors.requiredByDate) || '',
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            {/* Issue Description */}
            {requestStatusType !== 'New' && (
              <Grid size={12} pb="10px">
                <ShakingTextField
                  error={formik.touched.issueDescription && Boolean(formik.errors.issueDescription)}
                >
                  <Editor
                    onChange={(value) => formik.setFieldValue('issueDescription', value)}
                    value={formik.values.issueDescription}
                    placeholder="Issue Description"
                    error={
                      formik.touched.issueDescription && Boolean(formik.errors.issueDescription)
                    }
                    helperText={
                      (formik.touched.issueDescription && formik.errors.issueDescription) || ''
                    }
                    editable={false}
                    sx={{ height: '100%' }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {requestStatusType === 'New' && (
              <Grid size={12} pb="10px">
                <ShakingTextField
                  error={
                    formik.touched.reasonForNewResource &&
                    Boolean(formik.errors.reasonForNewResource)
                  }
                >
                  <Editor
                    onChange={(value) => formik.setFieldValue('reasonForNewResource', value)}
                    value={formik.values.reasonForNewResource}
                    placeholder="Write Reason for New Resource"
                    error={
                      formik.touched.reasonForNewResource &&
                      Boolean(formik.errors.reasonForNewResource)
                    }
                    helperText={
                      (formik.touched.reasonForNewResource && formik.errors.reasonForNewResource) ||
                      ''
                    }
                    editable={false}
                    sx={{ height: '100%' }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {requestStatusType === 'New' && (
              <Grid size={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.approvedQuantity && Boolean(formik.errors.approvedQuantity)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Approved Quantity *"
                    value={formik.values.approvedQuantity}
                    onChange={(e) =>
                      formik.setFieldValue('approvedQuantity', Number(e.target.value))
                    }
                    error={
                      formik.touched.approvedQuantity && Boolean(formik.errors.approvedQuantity)
                    }
                    helperText={
                      (formik.touched.approvedQuantity && formik.errors.approvedQuantity) || ''
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}
            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.reasonByAdmin && Boolean(formik.errors.reasonByAdmin)}
              >
                <Editor
                  onChange={(value) => formik.setFieldValue('reasonByAdmin', value)}
                  value={formik.values.reasonByAdmin}
                  placeholder="Write Reason"
                  error={formik.touched.reasonByAdmin && Boolean(formik.errors.reasonByAdmin)}
                  helperText={(formik.touched.reasonByAdmin && formik.errors.reasonByAdmin) || ''}
                  editable
                  sx={{ height: '100%' }}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <CancelButton
            buttonText="Reject"
            onClick={() => {
              onClose();
            }}
          />
          <SubmitButton buttonText="Approved" onClick={() => {}} />
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};

export default ResourceRequestReviewDialog;
