import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { Grid, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialResourceAllocateValues } from '../initialValue';
import { resourceTransferValidationSchema } from '../validationSchema';

import type {
  IResourceAllocateFormValues,
  IResourceTransferDialogProps,
} from '../resource-allocation-interface';

const ResourceTransferDialog: React.FC<IResourceTransferDialogProps> = ({
  data,
  isEdit,
  handleClose,
}) => {
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
    validationSchema: resourceTransferValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid size={6} pb="10px">
            <ShakingTextField
              error={formik.touched.currentLocation && Boolean(formik.errors.currentLocation)}
            >
              <TextField
                disabled
                name="currentLocation"
                label="Current Location"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.currentLocation && Boolean(formik.errors.currentLocation)}
                helperText={formik.touched.currentLocation && formik.errors.currentLocation}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={6} pb="10px">
            <ShakingTextField
              error={formik.touched.allocationTarget && Boolean(formik.errors.allocationTarget)}
            >
              <CustomSelect
                label="Select Allocation Target *"
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
          <Grid size={6} pb="10px">
            <ShakingTextField
              error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
            >
              <CustomSelect
                label="Select Assigned To *"
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

          <Grid size={6}>
            <ShakingTextField
              error={formik.touched.transferDate && Boolean(formik.errors.transferDate)}
            >
              <DatePicker
                format="DD-MM-YYYY"
                label="Transfer Date *"
                value={formik.values.transferDate}
                onChange={(value) => {
                  formik.setFieldValue('transferDate', value);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.transferDate && Boolean(formik.errors.transferDate),
                    helperText: formik.touched.transferDate && formik.errors.transferDate,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={12} pb="10px">
            <ShakingTextField
              error={formik.touched.reasonOfTransfer && Boolean(formik.errors.reasonOfTransfer)}
            >
              <TextField
                multiline
                rows={4}
                name="reasonOfTransfer"
                label="Reason Of Transfer *"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.reasonOfTransfer && Boolean(formik.errors.reasonOfTransfer)}
                helperText={formik.touched.reasonOfTransfer && formik.errors.reasonOfTransfer}
              />
            </ShakingTextField>
          </Grid>
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
  );
};

export default ResourceTransferDialog;
