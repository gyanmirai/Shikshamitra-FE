import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialResourceAllocateValues } from '../initialValue';
import { resourceAllocateValidationSchema } from '../validationSchema';

import type {
  IResourceAllocateFormValues,
  IResourceAllocateDialogProps,
} from '../resource-allocation-interface';

const ResourceAllocateDialog: React.FC<IResourceAllocateDialogProps> = ({ data, isEdit }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  console.log('data', data);
  const initialValues = useMemo<IResourceAllocateFormValues>(
    () => getInitialResourceAllocateValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IResourceAllocateFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: resourceAllocateValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
            >
              <CustomSelect
                autoFocus
                label="Select Resource"
                options={[]}
                value={formik.values.resourceName}
                onChange={(value) => formik.setFieldValue('resourceName', value)}
                disabled={isEdit}
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                helperText={
                  formik.touched.resourceName && formik.errors.resourceName
                    ? String(formik.errors.resourceName)
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
              error={formik.touched.allocationTarget && Boolean(formik.errors.allocationTarget)}
            >
              <CustomSelect
                label="Select Allocation Target"
                options={[]}
                value={formik.values.allocationTarget}
                onChange={(value) => formik.setFieldValue('allocationTarget', value)}
                disabled={isEdit}
                error={formik.touched.allocationTarget && Boolean(formik.errors.allocationTarget)}
                helperText={
                  formik.touched.allocationTarget && formik.errors.allocationTarget
                    ? String(formik.errors.allocationTarget)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
            >
              <CustomSelect
                label="Select Assigned To"
                options={[]}
                value={formik.values.assignedTo}
                onChange={(value) => formik.setFieldValue('assignedTo', value)}
                disabled={isEdit}
                error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
                helperText={
                  formik.touched.assignedTo && formik.errors.assignedTo
                    ? String(formik.errors.assignedTo)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={6}>
            <ShakingTextField>
              <DatePicker
                format="DD-MM-YYYY"
                label="Allocation Date"
                value={formik.values.allocationDate}
                onChange={(value) => {
                  formik.setFieldValue('allocationDate', value);
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={6}>
            <ShakingTextField>
              <DatePicker
                format="DD-MM-YYYY"
                label="Expected Return Date"
                value={formik.values.expectedReturnDate}
                onChange={(value) => {
                  formik.setFieldValue('expectedReturnDate', value);
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.purposeOfAllocation && Boolean(formik.errors.purposeOfAllocation)
              }
            >
              <TextField
                multiline
                rows={4}
                name="purposeOfAllocation"
                label="Notes / purpose of allocation"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={
                  formik.touched.purposeOfAllocation && Boolean(formik.errors.purposeOfAllocation)
                }
                helperText={formik.touched.purposeOfAllocation && formik.errors.purposeOfAllocation}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </form>
  );
};

export default ResourceAllocateDialog;
