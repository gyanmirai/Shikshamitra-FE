import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialResourceValues } from './initialValue';
import { addResourceValidationSchema } from './validationSchema';

import type { IAddResourceFormValues, IAddResourceDialogProps } from '../inventory-interface';

const AddResourceDialog: React.FC<IAddResourceDialogProps> = ({
  open,
  handleClose,
  data,
  isEdit,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IAddResourceFormValues>(
    () => getInitialResourceValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IAddResourceFormValues>({
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
    <CustomDialog title="Add New Resource" open={open} handleClose={handleClose}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} pb="10px">
              <ShakingTextField
                error={formik.touched.roomNumber && Boolean(formik.errors.roomNumber)}
              >
                <CustomSelect
                  label="Select Category"
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

            <Grid item xs={12} pb="10px">
              <ShakingTextField error={formik.touched.itemName && Boolean(formik.errors.itemName)}>
                <TextField
                  name="itemName"
                  label="Item Name"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  autoFocus
                  disabled={isEdit}
                  error={formik.touched.itemName && Boolean(formik.errors.itemName)}
                  helperText={formik.touched.itemName && formik.errors.itemName}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={6} pb="10px">
              <ShakingTextField error={formik.touched.quantity && Boolean(formik.errors.quantity)}>
                <TextField
                  name="quantity"
                  label="Quantity"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={6} pb="10px">
              <ShakingTextField
                error={formik.touched.campusName && Boolean(formik.errors.campusName)}
              >
                <CustomSelect
                  label="Select Campus"
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

            <Grid item xs={6} pb="10px">
              <ShakingTextField
                error={formik.touched.buildingName && Boolean(formik.errors.buildingName)}
              >
                <CustomSelect
                  label="Select Building"
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

            <Grid item xs={6} pb="10px">
              <ShakingTextField
                error={formik.touched.floorNumber && Boolean(formik.errors.floorNumber)}
              >
                <CustomSelect
                  label="Floor Number"
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
            <Grid item xs={12} pb="10px">
              <ShakingTextField
                error={formik.touched.roomNumber && Boolean(formik.errors.roomNumber)}
              >
                <CustomSelect
                  label="Room Number"
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

            {/* <Grid item xs={6} pb="10px">
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
          <SubmitButton onClick={() => {}} />
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default AddResourceDialog;
