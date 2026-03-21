import React from 'react';
import { useFormik } from 'formik';
import { Editor } from 'src/components/editor';
import { Grid, DialogActions } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialDenyFormValues } from '../initialValue';
import { AccessLogsDenyValidationSchema } from '../validationSchema';

import type {
  IGateAcessDenyDialogProps,
  IAccessLogsManagementSecurityDenyFormValues,
} from '../access-logs-management-security-interface';

const GateAcessDenyDialog: React.FC<IGateAcessDenyDialogProps> = ({ data, onClose }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = getInitialDenyFormValues();

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IAccessLogsManagementSecurityDenyFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: AccessLogsDenyValidationSchema,

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
            <ShakingTextField error={formik.touched.notes && Boolean(formik.errors.notes)}>
              <Editor
                onChange={(value) => {
                  formik.setFieldValue('description', value);
                }}
                value={formik.values.notes}
                placeholder="Reasone For Deny *"
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                sx={{ height: '100%' }}
                slotProps={{
                  wrap: {
                    height: '100%',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <CancelButton onClick={onClose} />
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </form>
  );
};

export default GateAcessDenyDialog;
