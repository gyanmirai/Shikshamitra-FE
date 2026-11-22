'use client';

import type { RootState } from 'src/redux/store';
import type { PayrollApprovalSettings } from 'src/redux/runPayroll/payroll-approval-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import {
  Alert,
  Stack,
  Switch,
  Button,
  Skeleton,
  TextField,
  Typography,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';
import {
  usePayrollApproversQuery,
  usePayrollApprovalSettingsQuery,
  useConfigurePayrollApprovalMutation,
  useChangePayrollApprovalModeMutation,
} from 'src/redux/runPayroll/payroll-approval-api';

import { PayrollSectionReviewSettings } from './payroll-section-review-settings';

const modeDetails = {
  Legacy: {
    label: 'Manual finalization',
    action: 'activate',
    button: 'Activate workflow',
    description:
      'Staff with payroll lock permission can finalize reviewed rows. To require approval, save a designated approver and activate the workflow.',
  },
  Active: {
    label: 'Active',
    action: 'pause',
    button: 'Pause workflow',
    description:
      'HR sends reviewed payroll to the designated approver. Pausing stops new submissions and finalization. Pending batches can still be returned or withdrawn.',
  },
  Paused: {
    label: 'Paused',
    action: 'resume',
    button: 'Resume workflow',
    description:
      'Payroll submission and finalization are paused. Pending batches can be returned or withdrawn. Resuming restores submissions and finalization.',
  },
} as const;

type Draft = {
  version: number;
  approverId: string;
  allowSelfFinalization: boolean;
  reason: string;
};

function WorkflowForm({
  settings,
  reload,
  settingsUnavailable,
}: {
  settings: PayrollApprovalSettings;
  reload: () => Promise<unknown>;
  settingsUnavailable: boolean;
}) {
  const router = useRouter();
  const [lastSaved, setLastSaved] = useState<PayrollApprovalSettings>();
  const [draft, setDraft] = useState<Draft>();
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ error: boolean; text: string }>();
  const approvers = usePayrollApproversQuery(search);
  const [configure, configureState] = useConfigurePayrollApprovalMutation();
  const [changeMode, modeState] = useChangePayrollApprovalModeMutation();
  const saved = lastSaved && lastSaved.version > settings.version ? lastSaved : settings;
  const current = draft ?? {
    version: saved.version,
    approverId: saved.approverId ?? '',
    allowSelfFinalization: saved.allowSelfFinalization,
    reason: '',
  };
  const changed =
    current.approverId !== (saved.approverId ?? '') ||
    current.allowSelfFinalization !== saved.allowSelfFinalization;
  const conflict = Boolean(draft && draft.version !== saved.version);
  const busy = configureState.isLoading || modeState.isLoading;
  const unavailable = settingsUnavailable || approvers.isError || approvers.isLoading;
  const status = saved.mode === 'SectionReview' ? undefined : modeDetails[saved.mode];
  const options = approvers.currentData ?? [];
  const selected =
    options.find((option) => option.id === current.approverId) ??
    (current.approverId ? { id: current.approverId, name: 'Designated approver' } : null);
  const navigation = useUnsavedNavigation(changed || Boolean(current.reason.trim()), {
    push: router.push,
    blockNavigation: busy,
  });

  const update = (changes: Partial<Draft>) => {
    setFeedback(undefined);
    setDraft({ ...current, ...changes });
  };
  const save = async (modeChange: boolean) => {
    const reason = current.reason.trim();
    if (!status || busy || unavailable || conflict || !reason || !current.approverId) return;
    if (modeChange ? changed : !changed) return;
    const command = { expectedVersion: current.version, reason };
    try {
      const result = modeChange
        ? await changeMode({ ...command, action: status.action }).unwrap()
        : await configure({
            ...command,
            approverId: current.approverId,
            allowSelfFinalization: current.allowSelfFinalization,
          }).unwrap();
      setLastSaved(result);
      setDraft(undefined);
      setFeedback({ error: false, text: 'Approval workflow updated.' });
    } catch (error) {
      if (parseApiProblemDetail(error).errorCode === 'PAYROLL_SETTINGS_VERSION_CONFLICT') {
        await reload().catch(() => undefined);
      }
      setFeedback({ error: true, text: normalizeHrFailure(error).message });
    }
  };

  if (!status) return null;

  return (
    <FormSectionCard
      title="Workflow configuration"
      icon="mdi:clipboard-check-outline"
      action={
        <Label
          color={
            saved.mode === 'Active' ? 'success' : saved.mode === 'Paused' ? 'warning' : 'default'
          }
        >
          {status.label}
        </Label>
      }
      sx={{ width: '100%', maxWidth: 760 }}
    >
      <Stack
        component="form"
        noValidate
        spacing={2}
        onSubmit={async (event) => {
          event.preventDefault();
          await save(false);
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {status.description}
        </Typography>
        {approvers.isError && (
          <Alert
            severity="error"
            action={<Button onClick={() => approvers.refetch()}>Retry</Button>}
          >
            {normalizeHrFailure(approvers.error).title === 'Access Required'
              ? 'Managing approval settings requires school-wide payroll access.'
              : 'The approver directory could not be loaded.'}
          </Alert>
        )}
        <ShakingTextField>
          <Autocomplete
            options={options}
            value={selected}
            disabled={busy || unavailable || conflict}
            loading={approvers.isFetching}
            filterOptions={(choices) => choices}
            onInputChange={(_event, value, reason) => {
              if (reason === 'input' || reason === 'clear') setSearch(value);
            }}
            onChange={(_event, option) => update({ approverId: option?.id ?? '' })}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} required size="small" label="Designated principal or admin" />
            )}
          />
        </ShakingTextField>
        {saved.approverId && current.approverId !== saved.approverId && saved.mode !== 'Legacy' && (
          <Alert severity="warning">
            Pending batches stay assigned to their original approver. HR or a workflow manager can
            withdraw those batches so HR can review and resubmit them to the new approver.
          </Alert>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={current.allowSelfFinalization}
              onChange={(event) => update({ allowSelfFinalization: event.target.checked })}
            />
          }
          disabled={busy || unavailable || conflict}
          label="Allow authorized staff to finalize their own batches"
        />
        <Typography variant="body2" color="text.secondary">
          Self-finalization requires payroll review, submission, and lock permissions.
        </Typography>
        <ShakingTextField>
          <TextField
            label="Reason for change"
            value={current.reason}
            onChange={(event) => update({ reason: event.target.value })}
            disabled={busy || unavailable || conflict}
            fullWidth
            required
            size="small"
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </ShakingTextField>
        {conflict ? (
          <Alert
            severity="warning"
            action={
              <Button
                onClick={() => {
                  setDraft(undefined);
                  setFeedback(undefined);
                }}
              >
                Discard draft
              </Button>
            }
          >
            Approval settings changed while you were editing. Discard the draft to use the latest
            settings.
          </Alert>
        ) : (
          feedback && <Alert severity={feedback.error ? 'error' : 'success'}>{feedback.text}</Alert>
        )}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => save(true)}
            loading={modeState.isLoading}
            disabled={
              busy ||
              unavailable ||
              conflict ||
              changed ||
              !current.approverId ||
              !current.reason.trim()
            }
          >
            {status.button}
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={configureState.isLoading}
            disabled={
              busy ||
              unavailable ||
              conflict ||
              !changed ||
              !current.approverId ||
              !current.reason.trim()
            }
          >
            Save settings
          </Button>
        </Stack>
      </Stack>
      {navigation.confirmation}
    </FormSectionCard>
  );
}

export default function PayrollApprovalWorkflow() {
  const auth = useSelector((state: RootState) => state.auth);
  const month = useSearchParams().get('returnMonth');
  const returnMonth = month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : null;
  const ready = auth.permissionsInitialized && !auth.loading;
  const canManage =
    hasGrantedPermission(auth.permissions, hrPermissions.payroll.runPayrollManageWorkflow) &&
    hasGrantedPermission(auth.permissions, `${hrPermissions.payroll.runPayroll}.View`);
  const query = usePayrollApprovalSettingsQuery(undefined, {
    skip: !ready || !canManage,
    refetchOnMountOrArgChange: true,
  });
  return (
    <Stack spacing={2} sx={{ minWidth: 0, pb: 2, overflowY: 'auto' }}>
      <CustomBreadcrumbs
        heading="Approval Workflow"
        description="Manage how payroll is reviewed before it is finalized."
        links={[
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Settings', href: hrPaths.payroll.settings.root },
          { name: 'Approval Workflow' },
        ]}
        action={
          returnMonth &&
          canManage && (
            <Button
              component={RouterLink}
              variant="outlined"
              href={`${hrPaths.payroll.runPayroll}?month=${returnMonth}`}
            >
              Back to Run Payroll
            </Button>
          )
        }
      />
      {!ready ? (
        <Skeleton variant="rounded" height={220} aria-label="Loading approval workflow" />
      ) : !canManage ? (
        <HrNotice severity="info">
          You do not have access to manage the payroll approval workflow.
        </HrNotice>
      ) : query.isError && !query.currentData ? (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          Approval settings could not be loaded.
        </Alert>
      ) : query.currentData ? (
        <>
          {query.isError && (
            <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
              The latest approval settings could not be loaded. Retry to check the saved settings.
            </Alert>
          )}
          <PayrollSectionReviewSettings
            settings={query.currentData}
            reload={() => query.refetch()}
            settingsUnavailable={query.isError}
          />
          {(query.currentData.mode === 'Active' || query.currentData.mode === 'Paused' ||
            (query.currentData.mode === 'Legacy' && query.currentData.approverId)) && (
            <WorkflowForm
              settings={query.currentData}
              reload={() => query.refetch()}
              settingsUnavailable={query.isError}
            />
          )}
        </>
      ) : (
        <Skeleton variant="rounded" height={220} aria-label="Loading approval workflow" />
      )}
    </Stack>
  );
}
