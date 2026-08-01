'use client';

import type { AdmissionCrmConfigurationImpactPreviewDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState, useEffect } from 'react';
import { RouterLink } from 'src/routes/components';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { Iconify } from 'src/components/iconify';
import {
  useGetAdmissionCrmCycleConfigurationQuery,
  useUpdateAdmissionCrmCycleConfigurationMutation,
  usePreviewAdmissionCrmConfigurationImpactMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Paper,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { useAdmissionYearDraft } from './use-admission-year-draft';
import { buildAdmissionCrmCycleUpdate } from './admission-crm-cycle-update';
import { EnrollmentSettingsFlowPreview } from './enrollment-settings-decision-cards';
import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { attachAdmissionCrmImpactFingerprint } from './admissions-crm-configuration-utils';

import type { AdmissionCrmCycleUpdate } from './admission-crm-cycle-update';

const getErrorMessage = (error: unknown) => {
  const response = error as {
    data?: { error?: { message?: string }; message?: string };
  };
  return (
    response.data?.error?.message ||
    response.data?.message ||
    'Activation settings could not be saved.'
  );
};

export function ActivationSettingsConfiguration({ academicYearId }: { academicYearId: string }) {
  const { state } = useEnrollmentWorkspace();
  const admissionYear = useAdmissionYearDraft(academicYearId);
  const configurationQuery = useGetAdmissionCrmCycleConfigurationQuery({ academicYearId });
  const [updateConfiguration, updateState] = useUpdateAdmissionCrmCycleConfigurationMutation();
  const [previewImpact, previewState] = usePreviewAdmissionCrmConfigurationImpactMutation();
  const [cancellationWindowDays, setCancellationWindowDays] = useState(7);
  const [pendingUpdate, setPendingUpdate] = useState<{
    body: AdmissionCrmCycleUpdate;
    preview: AdmissionCrmConfigurationImpactPreviewDto;
  } | null>(null);
  const configuredWindow = configurationQuery.data?.activationCancellationWindowDays ?? 7;
  const isDirty = cancellationWindowDays !== configuredWindow;

  useEffect(() => {
    setCancellationWindowDays(configuredWindow);
  }, [configuredWindow]);

  useEnrollmentSettingsDirtyState({
    source: 'activation-settings',
    dirty: isDirty,
    onDiscard: () => setCancellationWindowDays(configuredWindow),
  });

  const commit = async (body: AdmissionCrmCycleUpdate, fingerprint: string) => {
    await updateConfiguration({
      academicYearId,
      body: attachAdmissionCrmImpactFingerprint(body, fingerprint),
    }).unwrap();
    setPendingUpdate(null);
    shikshaMitraToast.success({ message: 'Activation settings saved.' });
  };

  const save = async () => {
    const configuration = configurationQuery.data;
    if (!configuration) return;
    if (
      !Number.isInteger(cancellationWindowDays) ||
      cancellationWindowDays < 0 ||
      cancellationWindowDays > 90
    ) {
      shikshaMitraToast.error({
        message: 'Cancellation window must be a whole number from 0 to 90 days.',
      });
      return;
    }
    const body = buildAdmissionCrmCycleUpdate(configuration, {
      activationCancellationWindowDays: cancellationWindowDays,
    });
    try {
      const preview = await previewImpact({
        academicYearId,
        body: { proposedCycleConfiguration: body },
      }).unwrap();
      if (
        preview.affectedApplicantCount ||
        preview.configurationReferenceCount ||
        preview.warnings.length
      ) {
        setPendingUpdate({ body, preview });
        return;
      }
      await commit(body, preview.fingerprint);
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const confirm = async () => {
    if (!pendingUpdate) return;
    try {
      await commit(pendingUpdate.body, pendingUpdate.preview.fingerprint);
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const cycleQuery = state.cycle ? `?cycle=${encodeURIComponent(state.cycle)}` : '';
  const setup = admissionYear.effective;
  const gates = [
    {
      label: 'Registration verified',
      required: true,
      href: studentPaths.enrollment.settingsSections.registration,
      action: 'Review registration',
    },
    {
      label: 'Entrance exam eligible',
      required: setup?.entranceExamRequired ?? true,
      href: studentPaths.enrollment.settingsSections.entranceExam,
      action: 'Review exam policy',
    },
    {
      label: 'Finance verified',
      required: setup?.financeVerificationRequired ?? false,
      href: studentPaths.enrollment.settingsSections.financeHandoff,
      action: 'Review handoff',
    },
    {
      label: 'Class placement reviewed',
      required: true,
      href: studentPaths.enrollment.settingsSections.classPlacement,
      action: 'Review placement',
    },
    {
      label: 'Activation approved',
      required: true,
      href: studentPaths.enrollment.activation,
      action: 'Open activation work',
    },
  ] as const;

  if (configurationQuery.isLoading || admissionYear.versionsQuery.isLoading) {
    return <LinearProgress aria-label="Loading Activation settings" />;
  }

  if (configurationQuery.isError || admissionYear.versionsQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              if (configurationQuery.isError) configurationQuery.refetch();
              if (admissionYear.versionsQuery.isError) admissionYear.versionsQuery.refetch();
            }}
          >
            Retry
          </Button>
        }
      >
        Activation settings could not be loaded. Editing is unavailable until all required rules are
        restored.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            gap={1}
            alignItems={{ sm: 'center' }}
          >
            <Box>
              <Typography component="h2" variant="subtitle1">
                Activation Readiness
              </Typography>
              <Typography variant="body2" color="text.secondary">
                These backend-enforced checks must resolve before an active Student record is
                created.
              </Typography>
            </Box>
            <Chip
              variant="outlined"
              color="primary"
              label={`${gates.filter(({ required }) => required).length} required gates`}
            />
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 1,
            }}
          >
            {gates.map(({ label, required, href, action }) => (
              <Stack
                key={label}
                spacing={0.75}
                sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1.25 }}
              >
                <Iconify
                  icon={required ? 'mdi:shield-check-outline' : 'mdi:shield-off-outline'}
                  width={22}
                  sx={{ color: required ? 'success.main' : 'text.disabled' }}
                />
                <Typography variant="subtitle2">{label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {required ? 'Must be complete' : 'Not required this year'}
                </Typography>
                <Button
                  component={RouterLink}
                  href={`${href}${cycleQuery}`}
                  size="small"
                  variant="text"
                  sx={{ alignSelf: 'flex-start', mt: 'auto', px: 0 }}
                >
                  {action}
                </Button>
              </Stack>
            ))}
          </Box>
          <EnrollmentSettingsFlowPreview
            label="Activation workflow"
            steps={[
              {
                label: 'Readiness Checks',
                description:
                  'Registration, assessment, Finance, and placement gates are evaluated.',
                icon: 'mdi:clipboard-check-outline',
              },
              {
                label: 'Approval',
                description: 'An authorized staff member approves the final activation action.',
                icon: 'mdi:account-key-outline',
                status: 'Approve Activation permission required',
              },
              {
                label: 'Student Created',
                description:
                  'Student identity, placement, and access records are created together.',
                icon: 'mdi:account-school-outline',
              },
            ]}
          />
        </Stack>
      </Paper>

      <Divider />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
          gap: 1.5,
        }}
      >
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
          <Stack spacing={1.25}>
            <Box>
              <Typography component="h2" variant="subtitle1">
                Cancellation Window
              </Typography>
              <Typography variant="body2" color="text.secondary">
                After this period, cancellation requires the repair and approval workflow.
              </Typography>
            </Box>
            <TextField
              size="small"
              type="number"
              label="Days after activation"
              value={cancellationWindowDays}
              onChange={(event) => setCancellationWindowDays(Number(event.target.value))}
              inputProps={{ min: 0, max: 90, step: 1 }}
              helperText="Recommended starting point: 7 days"
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <Button
              variant="contained"
              disabled={!isDirty || updateState.isLoading || previewState.isLoading}
              onClick={save}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save Cancellation Rule
            </Button>
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
          <Stack spacing={1.25}>
            <Box>
              <Typography component="h2" variant="subtitle1">
                Family Communication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review the approved message sent after activation succeeds.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              href={`${studentPaths.enrollment.settingsSections.communication}${cycleQuery}`}
              variant="outlined"
              startIcon={<Iconify icon="mdi:message-text-outline" />}
              sx={{ alignSelf: 'flex-start' }}
            >
              Configure Activation Message
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Dialog
        open={Boolean(pendingUpdate)}
        onClose={() => !updateState.isLoading && setPendingUpdate(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Apply activation-setting change?</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="body2">
              This setting is referenced by {pendingUpdate?.preview.affectedApplicantCount || 0}{' '}
              applicant records.
            </Typography>
            {(pendingUpdate?.preview.warnings || []).map((warning) => (
              <Alert key={warning} severity="warning">
                {warning}
              </Alert>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={updateState.isLoading} onClick={() => setPendingUpdate(null)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={updateState.isLoading} onClick={confirm}>
            Apply change
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
