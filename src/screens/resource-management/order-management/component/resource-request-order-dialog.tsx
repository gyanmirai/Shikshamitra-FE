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

import { getInitialResourceRequestOrderValues } from '../initialValue';

import type { IResourceRequestOrderDialogProps } from '../order-management-interface';

const ResourceRequestOrderDialog: React.FC<IResourceRequestOrderDialogProps> = ({
  onClose,
  data,
  isEdit,
  requestStatusType,
  orderStatus,
}) => {
  const formik = useFormik({
    initialValues: getInitialResourceRequestOrderValues(data),
    onSubmit: (values) => {
      console.log(values);
    },
  });
  console.log('orderStatus', orderStatus);

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
            {requestStatusType !== 'New' && (
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
                        helperText:
                          (formik.touched.assignedDate && formik.errors.assignedDate) || '',
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            )}

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
            {requestStatusType !== 'New' && (
              <Grid item xs={12} pb="10px">
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
              <Grid item xs={12} pb="10px">
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
              <Grid item xs={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.approvedQuantity && Boolean(formik.errors.approvedQuantity)}
                >
                  <TextField
                    disabled
                    fullWidth
                    size="small"
                    type="number"
                    label="Approved Quantity By Admin *"
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
            <Grid item xs={12} pb="10px">
              <ShakingTextField
                error={formik.touched.reasonByAdmin && Boolean(formik.errors.reasonByAdmin)}
              >
                <Editor
                  onChange={(value) => formik.setFieldValue('reasonByAdmin', value)}
                  value={formik.values.reasonByAdmin}
                  placeholder="Write Reason"
                  error={formik.touched.reasonByAdmin && Boolean(formik.errors.reasonByAdmin)}
                  helperText={(formik.touched.reasonByAdmin && formik.errors.reasonByAdmin) || ''}
                  editable={false}
                  sx={{ height: '100%' }}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={6} pb="10px">
              <ShakingTextField
                error={formik.touched.assignedVendor && Boolean(formik.errors.assignedVendor)}
              >
                <TextField
                  disabled={orderStatus !== 'wantToOrder'}
                  fullWidth
                  size="small"
                  label="Assigned Vendor *"
                  value={formik.values.assignedVendor}
                  onChange={(e) => formik.setFieldValue('assignedVendor', e.target.value)}
                  error={formik.touched.assignedVendor && Boolean(formik.errors.assignedVendor)}
                  helperText={(formik.touched.assignedVendor && formik.errors.assignedVendor) || ''}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={6} pb="10px">
              <ShakingTextField
                error={formik.touched.orderQuantity && Boolean(formik.errors.orderQuantity)}
              >
                <TextField
                  disabled={orderStatus !== 'wantToOrder'}
                  fullWidth
                  size="small"
                  type="number"
                  label="Order Quantity *"
                  value={formik.values.orderQuantity}
                  onChange={(e) => formik.setFieldValue('orderQuantity', Number(e.target.value))}
                  error={formik.touched.orderQuantity && Boolean(formik.errors.orderQuantity)}
                  helperText={(formik.touched.orderQuantity && formik.errors.orderQuantity) || ''}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={6} pb="10px">
              <ShakingTextField error={formik.touched.costing && Boolean(formik.errors.costing)}>
                <NumericFormatCustom
                  disabled={orderStatus !== 'wantToOrder'}
                  size="small"
                  label="Order Amount"
                  name="costing"
                  value={formik.values.costing}
                  onChange={formik.handleChange}
                  fullWidth
                  error={formik.touched.costing && Boolean(formik.errors.costing)}
                  helperText={(formik.touched.costing && formik.errors.costing) || ''}
                />
              </ShakingTextField>
            </Grid>

            {orderStatus === 'cancelOrder' && (
              <Grid item xs={12} pb="10px">
                <ShakingTextField
                  error={
                    formik.touched.cancelOrderReason && Boolean(formik.errors.cancelOrderReason)
                  }
                >
                  <Editor
                    onChange={(value) => formik.setFieldValue('cancelOrderReason', value)}
                    value={formik.values.cancelOrderReason}
                    placeholder="Write Reason for cancel order"
                    error={
                      formik.touched.cancelOrderReason && Boolean(formik.errors.cancelOrderReason)
                    }
                    helperText={
                      (formik.touched.cancelOrderReason && formik.errors.cancelOrderReason) || ''
                    }
                    editable
                    sx={{ height: '100%' }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {orderStatus === 'returnOrder' && (
              <Grid item xs={12} pb="10px">
                <ShakingTextField
                  error={
                    formik.touched.returnOrderReason && Boolean(formik.errors.returnOrderReason)
                  }
                >
                  <Editor
                    onChange={(value) => formik.setFieldValue('returnOrderReason', value)}
                    value={formik.values.returnOrderReason}
                    placeholder="Write Reason For Return"
                    error={
                      formik.touched.returnOrderReason && Boolean(formik.errors.returnOrderReason)
                    }
                    helperText={
                      (formik.touched.returnOrderReason && formik.errors.returnOrderReason) || ''
                    }
                    editable
                    sx={{ height: '100%' }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {orderStatus === 'deliverOrder' && (
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

          {orderStatus === 'wantToOrder' && <SubmitButton buttonText="Order" onClick={() => {}} />}
          {orderStatus === 'deliverOrder' && (
            <SubmitButton buttonText="Mark As Delivered" onClick={() => {}} />
          )}
          {orderStatus === 'cancelOrder' && (
            <SubmitButton buttonText="Cancel Order" onClick={() => {}} />
          )}
          {orderStatus === 'returnOrder' && (
            <SubmitButton buttonText="Return Order" onClick={() => {}} />
          )}
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};

export default ResourceRequestOrderDialog;
