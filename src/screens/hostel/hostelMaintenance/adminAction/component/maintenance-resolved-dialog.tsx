import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getMaintenanceResolvedInitialValues } from '../initialValue';
import { maintenanceResolvedValidationSchema } from '../validationSchema';

import type {
  IMaintenceIncidentResolvedDialogProps,
  IMaintenceIncidentResolvedDialogFormValues,
} from '../saftey-management-admin-action-interface';

const MaintenceIncidentResolvedDialog: React.FC<IMaintenceIncidentResolvedDialogProps> = ({
  selectedItem,
  onClose,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IMaintenceIncidentResolvedDialogFormValues>(
    () => getMaintenanceResolvedInitialValues(),
    []
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IMaintenceIncidentResolvedDialogFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: maintenanceResolvedValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} pb="10px">
            <ShakingTextField error={formik.touched.notes && Boolean(formik.errors.notes)}>
              <TextField
                multiline
                rows={4}
                name="notes"
                label="Notes"
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
        <CancelButton onClick={onClose} />
        <SubmitButton onClick={() => {}} buttonText="Resolved" />
      </DialogActions>
    </form>
  );
};

export default MaintenceIncidentResolvedDialog;
