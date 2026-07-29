'use client';

import type { AdmissionCrmConfigurationImpactPreviewDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState, useEffect } from 'react';
import { RouterLink } from 'src/routes/components';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import {
  useGetAdmissionCrmCycleConfigurationQuery,
  useUpdateAdmissionCrmCycleConfigurationMutation,
  usePreviewAdmissionCrmConfigurationImpactMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Chip,
  List,
  Stack,
  Alert,
  Button,
  Dialog,
  Divider,
  ListItem,
  TextField,
  Typography,
  DialogTitle,
  ListItemText,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { useAdmissionYearDraft } from './use-admission-year-draft';
import { buildAdmissionCrmCycleUpdate } from './admission-crm-cycle-update';
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
    ['Registration verified', true],
    ['Entrance exam eligible', setup?.entranceExamRequired ?? true],
    ['Finance verified', setup?.financeVerificationRequired ?? false],
    ['Class placement reviewed', true],
    ['Activation approved', true],
  ] as const;

  if (configurationQuery.isLoading || admissionYear.versionsQuery.isLoading) {
    return <LinearProgress aria-label="Loading Activation settings" />;
  }

  return (
    <Stack spacing={2}>
      {configurationQuery.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => configurationQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Activation settings could not be loaded.
        </Alert>
      ) : null}

      <Box>
        <Typography variant="subtitle1">Required activation gates</Typography>
        <Typography variant="body2" color="text.secondary">
          These checks are enforced by the backend before an active Student record is created.
        </Typography>
      </Box>
      <List disablePadding>
        {gates.map(([label, required]) => (
          <ListItem
            key={label}
            divider
            secondaryAction={
              <Chip
                size="small"
                variant="outlined"
                color={required ? 'success' : 'default'}
                label={required ? 'Required' : 'Not required'}
              />
            }
          >
            <ListItemText primary={label} />
          </ListItem>
        ))}
      </List>
      <Alert severity="info">
        Activation approval is enforced through the dedicated Approve Activation permission.
      </Alert>

      <Divider />

      <Box>
        <Typography variant="subtitle1">Cancellation window</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          After this window, cancellation requires the repair and approval workflow.
        </Typography>
        <TextField
          size="small"
          type="number"
          label="Days after activation"
          value={cancellationWindowDays}
          onChange={(event) => setCancellationWindowDays(Number(event.target.value))}
          inputProps={{ min: 0, max: 90, step: 1 }}
          sx={{ width: { xs: '100%', sm: 240 } }}
        />
      </Box>

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button
          variant="contained"
          disabled={!isDirty || updateState.isLoading || previewState.isLoading}
          onClick={save}
        >
          Save
        </Button>
        <Button
          component={RouterLink}
          href={`${studentPaths.enrollment.settingsSections.communication}${cycleQuery}`}
          variant="outlined"
        >
          Configure activation message
        </Button>
      </Stack>

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
