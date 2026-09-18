import type {
  AssessmentScope,
  AssessmentSession,
  AssessmentSessionInput,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { Alert, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { assessmentErrorMessage } from './assessment-utils';
import { AssessmentSessionFields } from './assessment-session-fields';
import {
  assessmentSessionInitialValues,
  assessmentSessionSchemaWithBookings,
} from './assessment-session-form';

type Props = {
  scope: AssessmentScope;
  session?: AssessmentSession | null;
  onClose: () => void;
  onSave: (values: AssessmentSessionInput) => Promise<void>;
};

export function AssessmentSessionDialog({ scope, session, onClose, onSave }: Props) {
  const [error, setError] = useState('');
  const formik = useFormik<AssessmentSessionInput>({
    initialValues: assessmentSessionInitialValues(scope, session),
    validationSchema: assessmentSessionSchemaWithBookings(session?.bookedCount ?? 0),
    onSubmit: async (values) => {
      setError('');
      try {
        await onSave({ ...values, name: values.name.trim(), location: values.location.trim() });
        onClose();
      } catch (failure) {
        setError(assessmentErrorMessage(failure));
      }
    },
  });
  const cancel = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  return (
    <CustomDialog
      open
      handleClose={onClose}
      guardUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
      maxWidth="sm"
      title={session ? 'Edit assessment session' : 'Create assessment session'}
    >
      <DialogScrollContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {scope.offeringName} · {scope.stageName} · Workflow v{scope.workflowVersion}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {session && session.bookedCount > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This session has {session.bookedCount} bookings. Check arrangements before changing its
            time or location.
          </Alert>
        )}
        <AssessmentSessionFields formik={formik} disabled={formik.isSubmitting} />
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          onClick={cancel}
          disabled={formik.isSubmitting}
          startIcon={<Iconify icon="mdi:close" />}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => formik.handleSubmit()}
          disabled={formik.isSubmitting}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
        >
          {formik.isSubmitting ? 'Saving…' : 'Save session'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
