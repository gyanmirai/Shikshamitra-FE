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
  Divider,
  Typography,
  LinearProgress,
} from '@mui/material';
import { AdmissionCrmIntegrationCapabilityState } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { useGetAdmissionCrmIntegrationCapabilitiesQuery } from 'src/redux/student/admissions-crm/core-leads-api';

import { useAdmissionYearDraft } from './use-admission-year-draft';
import {
  EnrollmentSettingsFlowPreview,
  EnrollmentSettingsDecisionCards,
} from './enrollment-settings-decision-cards';
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
      <EnrollmentSettingsDecisionCards
        label="Finance verification gate"
        value={required}
        onChange={setRequired}
        disabled={admissionYear.isCreating || admissionYear.isSaving}
        options={[
          {
            value: true,
            title: 'Require Finance Verification',
            description:
              'Activation waits until Finance confirms payment or records an approved waiver.',
            icon: 'mdi:shield-check-outline',
            recommended: true,
            meta: 'Recommended when fees are collected before the student becomes active.',
          },
          {
            value: false,
            title: 'Do Not Block Activation',
            description:
              'Enrollment can activate the student while Finance continues payment follow-up independently.',
            icon: 'mdi:arrow-right-circle-outline',
            meta: 'Use only when school policy permits activation before fee verification.',
          },
        ]}
      />

      <Divider />

      <Box>
        <Typography component="h2" variant="subtitle1">
          Handoff Workflow
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.25 }}>
          Enrollment requests and displays verification. Finance remains the source of truth for
          payment, receipts, waivers, reconciliation, and refunds.
        </Typography>
        <EnrollmentSettingsFlowPreview
          label="Finance handoff workflow"
          steps={[
            {
              label: 'Registration Verified',
              description: 'The applicant completes registration and document checks.',
              icon: 'mdi:file-document-check-outline',
              status: 'Enrollment starts the handoff',
            },
            {
              label: 'Finance Decision',
              description: 'Finance records payment verification or an approved waiver reference.',
              icon: 'mdi:cash-check',
              status: isConnected
                ? 'Connected synchronization available'
                : 'Manual verification available',
            },
            {
              label: required ? 'Activation Unblocked' : 'Activation Continues',
              description: required
                ? 'Activation becomes available after the Finance decision is confirmed.'
                : 'Activation remains available while Finance follow-up continues.',
              icon: required
                ? 'mdi:lock-open-check-outline'
                : 'mdi:arrow-right-bold-circle-outline',
              status: required ? 'Blocking gate' : 'Non-blocking handoff',
            },
          ]}
        />
      </Box>

      <Box>
        <Typography component="h2" variant="subtitle1" sx={{ mb: 0.75 }}>
          Connection Status
        </Typography>
        <Alert severity={isConnected ? 'success' : 'info'}>
          {financeCapability?.detail ||
            'Finance synchronization is not connected. Authorized Finance staff can record the verified state and reference manually.'}
        </Alert>
      </Box>

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
