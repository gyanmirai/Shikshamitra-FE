import type { EligibilitySummary } from 'src/redux/student/admissions/admission-eligibility-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { EligibilityActionContext } from './eligibility-action-context';
import {
  eligibilityActionLabels,
  eligibilityActionSchema,
  eligibilityActionDescriptions,
} from './eligibility-action-model';

import type { EligibilityAction } from './eligibility-action-model';

export function EligibilityActionDialog({
  action,
  summary,
  exceptionId,
  onSubmit,
  onClose,
}: {
  action: EligibilityAction;
  summary: EligibilitySummary;
  exceptionId?: string;
  onSubmit: (reason: string) => Promise<unknown>;
  onClose: () => void;
}) {
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: eligibilityActionSchema(action),
    onSubmit: async (values) => {
      setError('');
      try {
        await onSubmit(values.reason.trim());
        shikshaMitraToast.success({ message: 'Eligibility updated' });
        onClose();
      } catch (failure) {
        const { detail } = parseApiProblemDetail(failure);
        setError(
          detail === 'Something went wrong'
            ? 'Unable to update eligibility. Refresh the results and try again.'
            : detail
        );
      }
    },
  });
  const cancel = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  const hasError = Boolean(formik.touched.reason && formik.errors.reason);
  return (
    <CustomDialog
      open
      title={eligibilityActionLabels[action]}
      maxWidth="sm"
      handleClose={onClose}
      guardUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2">{eligibilityActionDescriptions[action]}</Typography>
          {action !== 'evaluate' && (
            <EligibilityActionContext summary={summary} exceptionId={exceptionId} />
          )}
          {action !== 'evaluate' && (
            <ShakingTextField error={hasError}>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={3}
                label="Reason *"
                {...formik.getFieldProps('reason')}
                error={hasError}
                helperText={formik.touched.reason && formik.errors.reason}
                disabled={formik.isSubmitting}
              />
            </ShakingTextField>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
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
          disabled={formik.isSubmitting}
          onClick={() => formik.handleSubmit()}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
        >
          {formik.isSubmitting ? 'Saving…' : eligibilityActionLabels[action]}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
