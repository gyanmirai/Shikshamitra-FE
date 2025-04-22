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

            <Grid item xs={12} pb="10px">
              <ShakingTextField
                error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
              >
                <CustomSelect
                  label="Select Category"
                  options={[]}
                  value={formik.values.categoryName}
                  onChange={(value) => formik.setFieldValue('categoryName', value)}
                  disabled={isEdit}
                  error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                  helperText={
                    formik.touched.categoryName && formik.errors.categoryName
                      ? String(formik.errors.categoryName)
                      : ''
                  }
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
            </Grid>
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
