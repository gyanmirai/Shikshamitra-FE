import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { Grid, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { getAssignedToMaintenanceWardenInitialValues } from '../initialValue';
import { assignedToMaintenanceWardenValidationSchema } from '../validationSchema';

import type {
  IAssignedToMaintenanceWarden,
  IMaintenceIncidentAssignedToWardenDialogProps,
} from '../saftey-management-admin-action-interface';

const MaintenceIncidentAssignedToWardenDialog: React.FC<
  IMaintenceIncidentAssignedToWardenDialogProps
> = ({ data, isEdit, onClose }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IAssignedToMaintenanceWarden>(
    () => getAssignedToMaintenanceWardenInitialValues(data),
    [data]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IAssignedToMaintenanceWarden>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: assignedToMaintenanceWardenValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid size={12} pb="10px">
            <ShakingTextField
              error={formik.touched.wardenName && Boolean(formik.errors.wardenName)}
            >
              <CustomSelect
                label="Select Warden *"
                options={[]}
                value={formik.values.wardenName}
                onChange={(value) => formik.setFieldValue('wardenName', value)}
                disabled={isEdit}
                error={formik.touched.wardenName && Boolean(formik.errors.wardenName)}
                helperText={
                  formik.touched.wardenName && formik.errors.wardenName
                    ? String(formik.errors.wardenName)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={12} pb="10px">
            <ShakingTextField
              error={formik.touched.assignedDeadline && Boolean(formik.errors.assignedDeadline)}
            >
              <DatePicker
                label="Assigned Deadline *"
                format="DD-MM-YYYY"
                value={formik.values.assignedDeadline}
                onChange={(value) => formik.setFieldValue('assignedDeadline', value)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error:
                      formik.touched.assignedDeadline && Boolean(formik.errors.assignedDeadline),
                    helperText:
                      formik.touched.assignedDeadline && formik.errors.assignedDeadline
                        ? String(formik.errors.assignedDeadline)
                        : '',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={12} pb="10px">
            <ShakingTextField
              error={formik.touched.updateStatus && Boolean(formik.errors.updateStatus)}
            >
              <CustomSelect
                label="Update Status *"
                options={[]}
                value={formik.values.updateStatus}
                onChange={(value) => formik.setFieldValue('updateStatus', value)}
                disabled={isEdit}
                error={formik.touched.updateStatus && Boolean(formik.errors.updateStatus)}
                helperText={
                  formik.touched.updateStatus && formik.errors.updateStatus
                    ? String(formik.errors.updateStatus)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={12} pb="10px">
            <ShakingTextField error={formik.touched.notes && Boolean(formik.errors.notes)}>
              <TextField
                multiline
                rows={4}
                name="notes"
                label="Notes *"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <CancelButton onClick={onClose} buttonText="Cancel" />
        <SubmitButton onClick={() => {}} buttonText="Assign" />
      </DialogActions>
    </form>
  );
};

export default MaintenceIncidentAssignedToWardenDialog;
