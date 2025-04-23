import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialIssueResourceValues } from './initialValue';
import { issueResourceValidationSchema } from './validationSchema';

import type { IIssueResourceFormValues, IIssueResourceDialogProps } from '../inventory-interface';

const IssueResourceDialog: React.FC<IIssueResourceDialogProps> = ({
  open,
  handleClose,
  data,
  isEdit,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IIssueResourceFormValues>(
    () => getInitialIssueResourceValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IIssueResourceFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: issueResourceValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  return (
    <CustomDialog title="Issue Resource" open={open} handleClose={handleClose}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} pb="10px">
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
              <ShakingTextField error={formik.touched.issuedTo && Boolean(formik.errors.issuedTo)}>
                <TextField
                  name="issuedTo"
                  label="Issued To"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  error={formik.touched.issuedTo && Boolean(formik.errors.issuedTo)}
                  helperText={formik.touched.issuedTo && formik.errors.issuedTo}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} pb="10px">
              <ShakingTextField error={formik.touched.purpose && Boolean(formik.errors.purpose)}>
                <TextField
                  name="purpose"
                  label="Purpose"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                  disabled={isEdit}
                  error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                  helperText={formik.touched.purpose && formik.errors.purpose}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} pb="10px">
              <ShakingTextField error={formik.touched.date && Boolean(formik.errors.date)}>
                <DatePicker
                  label="Date"
                  value={formik.values.date}
                  onChange={(newValue) => formik.setFieldValue('date', newValue)}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  disabled={isEdit}
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

export default IssueResourceDialog;
