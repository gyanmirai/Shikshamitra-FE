import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { Grid, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialProcurementValues } from './initialValue';
import { procurementValidationSchema } from './validationSchema';

import type {
  IProcurementFormValues,
  IProcurementResourceDialogProps,
} from '../inventory-interface';

const ProcurementResourceDialog: React.FC<IProcurementResourceDialogProps> = ({
  open,
  handleClose,
  data,
  isEdit,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IProcurementFormValues>(
    () => getInitialProcurementValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IProcurementFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: procurementValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  return (
    <CustomDialog
      maxWidth="md"
      title="Create Procurement Request"
      open={open}
      handleClose={handleClose}
    >
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.selectItem && Boolean(formik.errors.selectItem)}
              >
                <CustomSelect
                  autoFocus
                  label="Select Item"
                  options={[]}
                  value={formik.values.selectItem}
                  onChange={(value) => formik.setFieldValue('selectItem', value)}
                  disabled={isEdit}
                  error={formik.touched.selectItem && Boolean(formik.errors.selectItem)}
                  helperText={
                    formik.touched.selectItem && formik.errors.selectItem
                      ? String(formik.errors.selectItem)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={6} pb="10px">
              <ShakingTextField error={formik.touched.category && Boolean(formik.errors.category)}>
                <CustomSelect
                  autoFocus
                  label="Category"
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
              <ShakingTextField error={formik.touched.priority && Boolean(formik.errors.priority)}>
                <CustomSelect
                  autoFocus
                  label="Priority"
                  options={[]}
                  value={formik.values.priority}
                  onChange={(value) => formik.setFieldValue('priority', value)}
                  disabled={isEdit}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  helperText={
                    formik.touched.priority && formik.errors.priority
                      ? String(formik.errors.priority)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
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
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.estimatedCost && Boolean(formik.errors.estimatedCost)}
              >
                <TextField
                  name="estimatedCost"
                  label="Estimated Cost"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  error={formik.touched.estimatedCost && Boolean(formik.errors.estimatedCost)}
                  helperText={formik.touched.estimatedCost && formik.errors.estimatedCost}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.requestedBy && Boolean(formik.errors.requestedBy)}
              >
                <TextField
                  name="requestedBy"
                  label="Reqquested By"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  error={formik.touched.requestedBy && Boolean(formik.errors.requestedBy)}
                  helperText={formik.touched.requestedBy && formik.errors.requestedBy}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.prefrerredVendor && Boolean(formik.errors.prefrerredVendor)}
              >
                <TextField
                  name="prefrerredVendor"
                  label="Prefrred Vendor"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  disabled={isEdit}
                  error={formik.touched.prefrerredVendor && Boolean(formik.errors.prefrerredVendor)}
                  helperText={formik.touched.prefrerredVendor && formik.errors.prefrerredVendor}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.justification && Boolean(formik.errors.justification)}
              >
                <TextField
                  name="justification"
                  label="Prefrred Vendor"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  disabled={isEdit}
                  error={formik.touched.justification && Boolean(formik.errors.justification)}
                  helperText={formik.touched.justification && formik.errors.justification}
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

export default ProcurementResourceDialog;
