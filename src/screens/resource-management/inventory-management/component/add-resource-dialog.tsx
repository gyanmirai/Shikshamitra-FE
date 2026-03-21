import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { Iconify } from 'src/components/iconify/iconify';
import { UploadBox } from 'src/components/upload/upload-box';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, TextField, Typography, DialogActions } from '@mui/material';

import { getInitialInventoryItem } from './initialValue';
import { addResourceValidationSchema } from './validationSchema';

import type { IInventoryItem, IAddResourceDialogProps } from '../inventory-interface';

const AddResourceDialog: React.FC<IAddResourceDialogProps> = ({
  open,
  handleClose,
  data,
  isEdit,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IInventoryItem>(
    () => getInitialInventoryItem(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IInventoryItem>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: addResourceValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  return (
    <CustomDialog
      maxWidth="md"
      title={`${isEdit ? 'Edit' : 'Add'}   New Resource`}
      open={open}
      handleClose={handleClose}
    >
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={6} pb="10px">
              <ShakingTextField error={formik.touched.category && Boolean(formik.errors.category)}>
                <CustomSelect
                  label="Select Category *"
                  options={[]}
                  value={formik.values.category}
                  onChange={(value) => formik.setFieldValue('category', value)}
                  disabled={isEdit}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={
                    formik.touched.category && formik.errors.category
                      ? String(formik.errors.category)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
              >
                <CustomSelect
                  label="Select Sub Category *"
                  options={[]}
                  value={formik.values.subCategory}
                  onChange={(value) => formik.setFieldValue('subCategory', value)}
                  disabled={isEdit}
                  error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
                  helperText={
                    formik.touched.subCategory && formik.errors.subCategory
                      ? String(formik.errors.subCategory)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={12} pb="10px">
              <ShakingTextField error={formik.touched.itemName && Boolean(formik.errors.itemName)}>
                <TextField
                  name="itemName"
                  label="Item Name *"
                  value={formik.values.itemName}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  autoFocus
                  disabled={isEdit}
                  error={formik.touched.itemName && Boolean(formik.errors.itemName)}
                  helperText={formik.touched.itemName && formik.errors.itemName}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={
                  formik.touched.resourceMeasurementUnit &&
                  Boolean(formik.errors.resourceMeasurementUnit)
                }
              >
                <CustomSelect
                  label="Resource Measurement Unit *"
                  options={[]}
                  value={formik.values.resourceMeasurementUnit}
                  onChange={(value) => formik.setFieldValue('resourceMeasurementUnit', value)}
                  disabled={isEdit}
                  error={
                    formik.touched.resourceMeasurementUnit &&
                    Boolean(formik.errors.resourceMeasurementUnit)
                  }
                  helperText={
                    formik.touched.resourceMeasurementUnit && formik.errors.resourceMeasurementUnit
                      ? String(formik.errors.resourceMeasurementUnit)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField error={formik.touched.quantity && Boolean(formik.errors.quantity)}>
                <TextField
                  disabled={isEdit}
                  name="quantity"
                  label="Quantity *"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={
                  formik.touched.purchasedVendorName && Boolean(formik.errors.purchasedVendorName)
                }
              >
                <CustomSelect
                  disabled={isEdit}
                  label="Purchased Vendor Name *"
                  options={[]}
                  value={formik.values.purchasedVendorName}
                  onChange={(value) => formik.setFieldValue('purchasedVendorName', value)}
                  error={
                    formik.touched.purchasedVendorName && Boolean(formik.errors.purchasedVendorName)
                  }
                  helperText={
                    formik.touched.purchasedVendorName && formik.errors.purchasedVendorName
                      ? String(formik.errors.purchasedVendorName)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={
                  formik.touched.resourcePurchaseDate && Boolean(formik.errors.resourcePurchaseDate)
                }
              >
                <DatePicker
                  value={
                    formik.values.resourcePurchaseDate
                      ? dayjs(formik.values.resourcePurchaseDate)
                      : null
                  }
                  disabled={isEdit}
                  onChange={(value) => formik.setFieldValue('resourcePurchaseDate', value)}
                  label="Resource Purchase Date"
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error:
                        formik.touched.resourcePurchaseDate &&
                        Boolean(formik.errors.resourcePurchaseDate),
                      helperText:
                        formik.touched.resourcePurchaseDate && formik.errors.resourcePurchaseDate,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={
                  formik.touched.warrantyExpiryDate && Boolean(formik.errors.warrantyExpiryDate)
                }
              >
                <DatePicker
                  value={
                    formik.values.warrantyExpiryDate
                      ? dayjs(formik.values.warrantyExpiryDate)
                      : null
                  }
                  disabled={isEdit}
                  onChange={(value) => formik.setFieldValue('warrantyExpiryDate', value)}
                  label="Warranty Expiray Date"
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error:
                        formik.touched.warrantyExpiryDate &&
                        Boolean(formik.errors.warrantyExpiryDate),
                      helperText:
                        formik.touched.warrantyExpiryDate && formik.errors.warrantyExpiryDate,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.campusName && Boolean(formik.errors.campusName)}
              >
                <CustomSelect
                  label="Select Campus *"
                  options={[]}
                  value={formik.values.campusName}
                  onChange={(value) => formik.setFieldValue('campusName', value)}
                  disabled={isEdit}
                  error={formik.touched.campusName && Boolean(formik.errors.campusName)}
                  helperText={
                    formik.touched.campusName && formik.errors.campusName
                      ? String(formik.errors.campusName)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.buildingName && Boolean(formik.errors.buildingName)}
              >
                <CustomSelect
                  label="Select Building *"
                  options={[]}
                  value={formik.values.buildingName}
                  onChange={(value) => formik.setFieldValue('buildingName', value)}
                  disabled={isEdit}
                  error={formik.touched.buildingName && Boolean(formik.errors.buildingName)}
                  helperText={
                    formik.touched.buildingName && formik.errors.buildingName
                      ? String(formik.errors.buildingName)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.floorNumber && Boolean(formik.errors.floorNumber)}
              >
                <CustomSelect
                  label="Floor Number *"
                  options={[]}
                  value={formik.values.floorNumber}
                  onChange={(value) => formik.setFieldValue('floorNumber', value)}
                  disabled={isEdit}
                  error={formik.touched.floorNumber && Boolean(formik.errors.floorNumber)}
                  helperText={
                    formik.touched.floorNumber && formik.errors.floorNumber
                      ? String(formik.errors.floorNumber)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.roomNumber && Boolean(formik.errors.roomNumber)}
              >
                <CustomSelect
                  label="Room Number *"
                  options={[]}
                  value={formik.values.roomNumber}
                  onChange={(value) => formik.setFieldValue('roomNumber', value)}
                  disabled={isEdit}
                  error={formik.touched.roomNumber && Boolean(formik.errors.roomNumber)}
                  helperText={
                    formik.touched.roomNumber && formik.errors.roomNumber
                      ? String(formik.errors.roomNumber)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.termAndCondition && Boolean(formik.errors.termAndCondition)}
              >
                <TextField
                  multiline
                  rows={6}
                  name="termAndCondition"
                  label="Term And Condition *"
                  value={formik.values.termAndCondition}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.termAndCondition && Boolean(formik.errors.termAndCondition)}
                  helperText={formik.touched.termAndCondition && formik.errors.termAndCondition}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={12}>
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
                    <Typography variant="body2">Upload Resource Bill</Typography>
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

            {/* <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.storageLocation && Boolean(formik.errors.storageLocation)}
              >
                <TextField
                  name="storageLocation"
                  label="Storage Location"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  error={formik.touched.storageLocation && Boolean(formik.errors.storageLocation)}
                  helperText={formik.touched.storageLocation && formik.errors.storageLocation}
                />
              </ShakingTextField>
            </Grid> */}
          </Grid>
        </Scrollbar>
        <DialogActions>
          <CancelButton
            onClick={() => {
              handleClose();
            }}
          />
          <SubmitButton onClick={() => {}} />
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default AddResourceDialog;
