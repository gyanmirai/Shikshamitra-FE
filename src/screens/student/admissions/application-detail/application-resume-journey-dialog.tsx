'use client';

import type { AdmissionJourneyResumePreview } from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

type Props = {
  applicationNumber: string;
  applicantName: string;
  preview?: AdmissionJourneyResumePreview;
  loading: boolean;
  saving: boolean;
  reasonLocked?: boolean;
  error: string;
  onRetry: () => void;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<string | null>;
};

/** Mounted only while open: each closure gets a fresh audited reason draft. */
export function ApplicationResumeJourneyDialog({
  applicationNumber,
  applicantName,
  preview,
  loading,
  saving,
  reasonLocked = false,
  error,
  onRetry,
  onClose,
  onSubmit,
}: Props) {
  const [discardOpen, setDiscardOpen] = useState(false);
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('A reason is required')
        .max(512, 'Use 512 characters or fewer'),
    }),
    onSubmit: async ({ reason }, helpers) => {
      if (!preview?.canResume || loading || saving) return;
      helpers.setStatus(undefined);
      const failure = await onSubmit(reason.trim());
      if (failure) helpers.setStatus(failure);
      else onClose();
    },
  });
  const busy = saving || formik.isSubmitting;
  const requestClose = () => {
    if (busy) return;
    if (formik.dirty) setDiscardOpen(true);
    else onClose();
  };
  return (
    <>
      <CustomDialog
        open
        title="Resume Admission"
        titleInfo="Continue the same application from its last unfinished stage. Completed work, payments and withdrawal history are retained."
        handleClose={requestClose}
        disableClose={busy}
        guardUnsavedChanges={false}
        maxWidth="sm"
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            event.stopPropagation();
            formik.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <FormSectionCard
            title="Resume Details"
            icon={GlobalIcons.admissionDetails}
            descriptionTooltip="The resume stage is determined from the saved withdrawal history. Released bookings are not automatically restored."
          >
            <Stack spacing={1.5}>
              <Stack component="dl" spacing={0.5} sx={{ m: 0 }}>
                <Typography component="dt" variant="caption" color="text.secondary">
                  Applicant
                </Typography>
                <Typography
                  component="dd"
                  variant="subtitle2"
                  sx={{ m: 0, overflowWrap: 'anywhere' }}
                >
                  {applicantName}
                </Typography>
                <Typography component="dt" variant="caption" color="text.secondary">
                  Application
                </Typography>
                <Typography component="dd" sx={{ m: 0 }}>
                  {applicationNumber}
                </Typography>
                <Typography component="dt" variant="caption" color="text.secondary">
                  Resume at
                </Typography>
                <Typography component="dd" sx={{ m: 0 }}>
                  {loading ? <Skeleton width="65%" /> : preview?.targetStageName || 'Unavailable'}
                </Typography>
              </Stack>
              {error && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={onRetry}
                      disabled={busy || loading}
                    >
                      Retry
                    </Button>
                  }
                >
                  {error}
                </Alert>
              )}
              {preview?.blockers.map((blocker) => (
                <Alert severity="error" key={blocker}>
                  {blocker}
                </Alert>
              ))}
              {preview?.warnings.map((warning) => (
                <Typography variant="body2" color="text.secondary" key={warning}>
                  {warning}
                </Typography>
              ))}
              <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
                <TextField
                  name="reason"
                  label="Reason"
                  required
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                  disabled={busy || loading || reasonLocked || !preview?.canResume}
                  value={formik.values.reason}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.reason && formik.errors.reason)}
                  helperText={formik.touched.reason && formik.errors.reason}
                  inputProps={{ maxLength: 513 }}
                />
              </ShakingTextField>
              {formik.status && <Alert severity="error">{formik.status}</Alert>}
            </Stack>
          </FormSectionCard>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={requestClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.retrunIcon} />}
            loading={busy}
            disabled={loading || Boolean(error) || !preview?.canResume}
          >
            Resume admission
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard Changes"
        content="Discard the resume reason?"
        cancelText="Keep editing"
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={onClose}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}
