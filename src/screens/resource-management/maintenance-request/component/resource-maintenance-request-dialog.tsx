'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField, Typography, DialogActions } from '@mui/material';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialResourceRequestMaintenanceValues } from '../initialValue';

import type { IResourceRequestMaintenanceDialogProps } from '../resource-maintenance-request-interface';

const ResourceRequestMaintenaceDialog: React.FC<IResourceRequestMaintenanceDialogProps> = ({
  onClose,
  data,
  isEdit,
  maintenanceStatus,
}) => {
  const formik = useFormik({
    initialValues: getInitialResourceRequestMaintenanceValues(data),
    onSubmit: (values) => {
      console.log(values);
    },
  });
  console.log('orderStatus', maintenanceStatus);

  const isDisabled = data !== null && isEdit === false;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '100%', bgcolor: 'background.neutral' }}>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={6} pb="10px">
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

            <Grid item xs={6} pb="10px">
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
                      helperText: (formik.touched.assignedDate && formik.errors.assignedDate) || '',
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={6} pb="10px">
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

            <Grid item xs={6} pb="10px">
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

            <Grid item xs={6} pb="10px">
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

            <Grid item xs={6} pb="10px">
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
            <Grid item xs={6} pb="10px">
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

            <Grid item xs={6} pb="10px">
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
            <Grid item xs={12} pb="10px">
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
                  editable={false}
                  sx={{ height: '100%' }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} pb="10px">
              <ShakingTextField
                error={formik.touched.reasonByAdmin && Boolean(formik.errors.reasonByAdmin)}
              >
                <Editor
                  onChange={(value) => formik.setFieldValue('reasonByAdmin', value)}
                  value={formik.values.reasonByAdmin}
                  placeholder="Reason By Admin"
                  error={formik.touched.reasonByAdmin && Boolean(formik.errors.reasonByAdmin)}
                  helperText={(formik.touched.reasonByAdmin && formik.errors.reasonByAdmin) || ''}
                  editable={false}
                  sx={{ height: '100%' }}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={6} pb="10px">
              <ShakingTextField
                error={formik.touched.assignedEngineer && Boolean(formik.errors.assignedEngineer)}
              >
                <TextField
                  disabled={maintenanceStatus !== 'pending'}
                  fullWidth
                  size="small"
                  type="text"
                  label="Assigned Engineer *"
                  value={formik.values.assignedEngineer}
                  onChange={(e) => formik.setFieldValue('assignedEngineer', Number(e.target.value))}
                  error={formik.touched.assignedEngineer && Boolean(formik.errors.assignedEngineer)}
                  helperText={
                    (formik.touched.assignedEngineer && formik.errors.assignedEngineer) || ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={6} pb="10px">
              <ShakingTextField error={formik.touched.costing && Boolean(formik.errors.costing)}>
                <NumericFormatCustom
                  disabled={maintenanceStatus !== 'pending'}
                  size="small"
                  label="Amount"
                  name="costing"
                  value={formik.values.costing}
                  onChange={formik.handleChange}
                  fullWidth
                  error={formik.touched.costing && Boolean(formik.errors.costing)}
                  helperText={(formik.touched.costing && formik.errors.costing) || ''}
                />
              </ShakingTextField>
            </Grid>
            {(maintenanceStatus === 'Not Repaired' || maintenanceStatus === 'dispose') && (
              <Grid item xs={12} pb="10px">
                <ShakingTextField
                  error={
                    formik.touched.notRepairbleReason && Boolean(formik.errors.notRepairbleReason)
                  }
                >
                  <Editor
                    onChange={(value) => formik.setFieldValue('notRepairbleReason', value)}
                    value={formik.values.notRepairbleReason}
                    placeholder="Write Reason for not repairable"
                    error={
                      formik.touched.notRepairbleReason && Boolean(formik.errors.notRepairbleReason)
                    }
                    helperText={
                      (formik.touched.notRepairbleReason && formik.errors.notRepairbleReason) || ''
                    }
                    editable={maintenanceStatus === 'Not Repaired'}
                    sx={{ height: '100%' }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {maintenanceStatus === 'Repair Completed' && (
              <Grid item xs={12} sx={{ pb: '10px' }}>
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
                      <Typography variant="body2">Upload Bill</Typography>
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
            )}
          </Grid>
        </Scrollbar>
        <DialogActions>
          <CancelButton
            onClick={() => {
              onClose();
            }}
          />

          {maintenanceStatus === 'pending' && (
            <SubmitButton buttonText="Assign Technician" onClick={() => {}} />
          )}
          {maintenanceStatus === 'Repair Completed' && (
            <SubmitButton buttonText="Mark As Repaired" onClick={() => {}} />
          )}
          {maintenanceStatus === 'Not Repaired' && (
            <SubmitButton buttonText="Not Repairable" onClick={() => {}} />
          )}
          {maintenanceStatus === 'dispose' && (
            <SubmitButton buttonText="Dispose" onClick={() => {}} />
          )}
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};

export default ResourceRequestMaintenaceDialog;
