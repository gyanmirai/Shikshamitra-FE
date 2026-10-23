'use client';

import type { AdmissionWorkflowGovernanceSettings } from 'src/redux/student/admissions/admission-workflows-api';

import * as yup from 'yup';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Switch, DialogActions, FormControlLabel } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

type Props = {
  open: boolean;
  settings?: AdmissionWorkflowGovernanceSettings;
  loading: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (settings: AdmissionWorkflowGovernanceSettings) => Promise<void>;
};

export function WorkflowGovernanceSettingsDialog({
  open,
  settings,
  loading,
  saving,
  onClose,
  onSave,
}: Props) {
  const formik = useFormik<AdmissionWorkflowGovernanceSettings>({
    enableReinitialize: true,
    initialValues: settings ?? {
      makerCheckerEnabled: false,
      inAppNotificationsEnabled: true,
      emailNotificationsEnabled: true,
    },
    validationSchema: yup.object({
      makerCheckerEnabled: yup.boolean().required(),
      inAppNotificationsEnabled: yup.boolean().required(),
      emailNotificationsEnabled: yup.boolean().required(),
    }),
    onSubmit: onSave,
  });

  const resetSettingsForm = formik.resetForm;
  useEffect(() => {
    if (!open) return;
    resetSettingsForm({
      values: settings ?? {
        makerCheckerEnabled: false,
        inAppNotificationsEnabled: true,
        emailNotificationsEnabled: true,
      },
    });
  }, [open, resetSettingsForm, settings]);

  const handleCancel = () => {
    if (formik.dirty && !window.confirm('Discard the governance setting changes?')) return;
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      maxWidth="sm"
      title="Workflow governance"
      handleClose={saving ? () => undefined : onClose}
      disableClose={saving}
      hasUnsavedChanges={formik.dirty}
    >
      <DialogScrollContent onSubmit={formik.handleSubmit}>
        <Stack spacing={1.5}>
          <StudentFeedback notificationKey="STU-0618" presentation="inline" severity="info">
            When maker-checker is enabled, a different authorized user must approve each workflow
            before it can be scheduled or published.
          </StudentFeedback>
          <FormControlLabel
            label="Require maker-checker approval"
            control={
              <Switch
                name="makerCheckerEnabled"
                checked={formik.values.makerCheckerEnabled}
                disabled={loading || saving}
                onChange={(_, checked) => formik.setFieldValue('makerCheckerEnabled', checked)}
              />
            }
          />
          <FormControlLabel
            label="Send in-app governance notifications"
            control={
              <Switch
                name="inAppNotificationsEnabled"
                checked={formik.values.inAppNotificationsEnabled}
                disabled={loading || saving}
                onChange={(_, checked) =>
                  formik.setFieldValue('inAppNotificationsEnabled', checked)
                }
              />
            }
          />
          <FormControlLabel
            label="Send governance email notifications"
            control={
              <Switch
                name="emailNotificationsEnabled"
                checked={formik.values.emailNotificationsEnabled}
                disabled={loading || saving}
                onChange={(_, checked) =>
                  formik.setFieldValue('emailNotificationsEnabled', checked)
                }
              />
            }
          />
          <StudentFeedback
            notificationKey="STU-0619"
            presentation="inline"
            severity={formik.values.makerCheckerEnabled ? 'success' : 'warning'}
            icon={false}
          >
            {formik.values.makerCheckerEnabled
              ? 'Draft → Validated → Submitted → Approved → Scheduled or Published'
              : 'Authorized administrators can validate and publish directly.'}
          </StudentFeedback>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <LoadingButton
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          size="small"
          type="submit"
          variant="contained"
          loading={saving}
          disabled={loading}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          onClick={() => formik.handleSubmit()}
        >
          Save governance
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
