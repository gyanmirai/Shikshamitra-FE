'use client';

import { useState, useEffect } from 'react';
import { RouterLink } from 'src/routes/components';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Switch,
  Divider,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmIntegrationCapabilityState,
  useGetAdmissionCrmIntegrationCapabilitiesQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useAdmissionYearDraft } from './use-admission-year-draft';
import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

const getErrorMessage = (error: unknown) => {
  const response = error as {
    data?: { error?: { message?: string }; message?: string };
  };
  return (
    response.data?.error?.message || response.data?.message || 'Finance handoff could not be saved.'
  );
};

export function FinanceHandoffConfiguration({ academicYearId }: { academicYearId: string }) {
  const { state } = useEnrollmentWorkspace();
  const admissionYear = useAdmissionYearDraft(academicYearId);
  const integrationsQuery = useGetAdmissionCrmIntegrationCapabilitiesQuery({ academicYearId });
  const [required, setRequired] = useState(false);
  const effectiveRequired = admissionYear.effective?.financeVerificationRequired ?? false;
  const isDirty = required !== effectiveRequired;

  useEffect(() => {
    setRequired(effectiveRequired);
  }, [effectiveRequired]);

  useEnrollmentSettingsDirtyState({
    source: 'finance-handoff-settings',
    dirty: isDirty,
    onDiscard: () => setRequired(effectiveRequired),
  });

  const save = async () => {
    if (admissionYear.versionsQuery.isError || integrationsQuery.isError) return;
    try {
      await admissionYear.savePatch({ financeVerificationRequired: required }, admissionYear.draft);
      shikshaMitraToast.success({
        message: 'Finance handoff saved in the Admission Year draft.',
      });
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const financeCapability = integrationsQuery.data?.find((item) => item.code === 'finance');
  const isConnected =
    financeCapability?.state === AdmissionCrmIntegrationCapabilityState.Configured;
  const cycleQuery = state.cycle ? `?cycle=${encodeURIComponent(state.cycle)}` : '';

  if (admissionYear.versionsQuery.isLoading || integrationsQuery.isLoading) {
    return <LinearProgress aria-label="Loading Finance handoff settings" />;
  }

  if (admissionYear.versionsQuery.isError || integrationsQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              if (admissionYear.versionsQuery.isError) admissionYear.versionsQuery.refetch();
              if (integrationsQuery.isError) integrationsQuery.refetch();
            }}
          >
            Retry
          </Button>
        }
      >
        Finance handoff settings or integration status could not be loaded. Editing is unavailable
        until both are restored.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={1}
      >
        <Box>
          <Typography variant="subtitle1">Verification gate</Typography>
          <Typography variant="body2" color="text.secondary">
            Require Finance to verify payment or an approved waiver before activation.
          </Typography>
        </Box>
        <Chip
          size="small"
          variant="outlined"
          color={admissionYear.draft ? 'warning' : admissionYear.published ? 'success' : 'default'}
          label={
            admissionYear.draft
              ? `Draft v${admissionYear.draft.version}`
              : admissionYear.published
                ? `Published v${admissionYear.published.version}`
                : 'Not configured'
          }
        />
      </Stack>
      <FormControlLabel
        control={
          <Switch checked={required} onChange={(event) => setRequired(event.target.checked)} />
        }
        label="Finance verification is required before activation"
      />

      <Divider />

      <Box>
        <Typography variant="subtitle1">Handoff behavior</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Finance remains the source of truth for every payment and waiver decision.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Enrollment requests verification after registration is verified.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Staff can see the Finance state, Finance reference, confirmed amount, and confirmation
          time.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Receipts, ledger posting, payment settlement, waivers, reconciliation, and refunds remain
          in Finance.
        </Typography>
      </Box>

      <Alert severity={isConnected ? 'success' : 'info'}>
        {financeCapability?.detail ||
          'Finance synchronization is not connected. Authorized Finance staff can record the verified state and reference manually.'}
      </Alert>

      {admissionYear.draft ? (
        <Alert severity="warning">
          This change affects new applicants only after the draft is published from Admission Year
          Setup.
        </Alert>
      ) : null}

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button
          variant="contained"
          disabled={!isDirty || admissionYear.isCreating || admissionYear.isSaving}
          onClick={save}
        >
          Save draft
        </Button>
        <Button
          component={RouterLink}
          href={`${studentPaths.enrollment.settingsSections.admissionYear}${cycleQuery}`}
          variant="outlined"
        >
          Review Admission Year Setup
        </Button>
      </Stack>
    </Stack>
  );
}
