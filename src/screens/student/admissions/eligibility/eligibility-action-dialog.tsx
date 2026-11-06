import type { EligibilitySummary } from 'src/redux/student/admissions/admission-eligibility-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { ReviewDialog } from '../review/review-dialog';
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
  const hasError = Boolean(formik.touched.reason && formik.errors.reason);
  return (
    <ReviewDialog
      open
      title={eligibilityActionLabels[action]}
      titleInfo={eligibilityActionDescriptions[action]}
      maxWidth="sm"
      onClose={onClose}
      dirty={formik.dirty}
      busy={formik.isSubmitting}
      formProps={{
        noValidate: true,
        onSubmit: (event) => {
          event.preventDefault();
          formik.handleSubmit();
        },
      }}
      actions={(requestClose) => (
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            onClick={requestClose}
            disabled={formik.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            loading={formik.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            {eligibilityActionLabels[action]}
          </Button>
        </DialogActions>
      )}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {error && (
            <StudentFeedback notificationKey="STU-0326" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
          <FormSectionCard
            title="Eligibility Decision"
            icon={GlobalIcons.notebook}
            descriptionTooltip={eligibilityActionDescriptions[action]}
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          >
            <Stack spacing={2}>
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
                    label="Reason"
                    required
                    {...formik.getFieldProps('reason')}
                    error={hasError}
                    helperText={formik.touched.reason && formik.errors.reason}
                    disabled={formik.isSubmitting}
                  />
                </ShakingTextField>
              )}
            </Stack>
          </FormSectionCard>
        </Stack>
      </DialogScrollContent>
    </ReviewDialog>
  );
}
