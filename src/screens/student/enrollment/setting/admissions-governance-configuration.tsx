'use client';

import type { AdmissionCrmStaffLookupDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Send, Cancel, Publish, Download, PlayArrow } from '@mui/icons-material';
import {
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmReportFrequency,
  AdmissionCrmRetentionAction,
  AdmissionCrmDelegationStatus,
  AdmissionCrmExportReportType,
  useGetAdmissionCrmStaffQuery,
  AdmissionCrmRetentionCategory,
  useGetAdmissionCrmExportsQuery,
  AdmissionCrmOperationsQueueType,
  AdmissionCrmPrivacyRequestStatus,
  useGetAdmissionCrmDelegationsQuery,
  useRequestAdmissionCrmExportMutation,
  useDownloadAdmissionCrmExportMutation,
  useGetAdmissionCrmPrivacyRequestsQuery,
  useGetAdmissionCrmReportSchedulesQuery,
  AdmissionCrmGovernedConfigurationStatus,
  useCancelAdmissionCrmDelegationMutation,
  useCreateAdmissionCrmDelegationMutation,
  useGetAdmissionCrmAdvisoryForecastQuery,
  useGetAdmissionCrmRetentionPoliciesQuery,
  useCreateAdmissionCrmReportScheduleMutation,
  useDecideAdmissionCrmPrivacyRequestMutation,
  useCreateAdmissionCrmRetentionPolicyMutation,
  useRunDueAdmissionCrmReportSchedulesMutation,
  useSubmitAdmissionCrmRetentionPolicyMutation,
  useCompleteAdmissionCrmPrivacyRequestMutation,
  usePublishAdmissionCrmRetentionPolicyMutation,
  useSetAdmissionCrmReportScheduleActiveMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import { downloadAdmissionExportFile } from '../admissions-crm/admission-export-download';

const reportLabels: Record<AdmissionCrmExportReportType, string> = {
  [AdmissionCrmExportReportType.Funnel]: 'Funnel',
  [AdmissionCrmExportReportType.OperationsQueue]: 'Operations queues',
  [AdmissionCrmExportReportType.AuditTimeline]: 'Audit timeline',
  [AdmissionCrmExportReportType.GovernmentReadiness]: 'Government readiness',
  [AdmissionCrmExportReportType.DataQuality]: 'Data quality',
};

const queueLabels: Partial<Record<AdmissionCrmOperationsQueueType, string>> = {
  [AdmissionCrmOperationsQueueType.DocumentVerificationBacklog]: 'Document verification',
  [AdmissionCrmOperationsQueueType.CapacityConflict]: 'Capacity conflicts',
  [AdmissionCrmOperationsQueueType.ActivationRepair]: 'Activation repair',
  [AdmissionCrmOperationsQueueType.RouteAppealReview]: 'Route appeals',
  [AdmissionCrmOperationsQueueType.ServiceHandoffException]: 'Service handoff exceptions',
};

const errorMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { errorCode?: string; detail?: string } };
    return data?.errorCode || data?.detail || 'Governance action failed.';
  }
  return 'Governance action failed.';
};

const isoHoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 3600000).toISOString().slice(0, 16);

const createGovernanceDefaults = () => ({
  policyCode: '',
  policyName: '',
  retainDays: 365,
  authorityNote: '',
  reportType: AdmissionCrmExportReportType.Funnel,
  scheduleName: '',
  frequency: AdmissionCrmReportFrequency.Weekly,
  nextRunAt: isoHoursFromNow(24),
  queueType: AdmissionCrmOperationsQueueType.DocumentVerificationBacklog,
  delegationStart: isoHoursFromNow(0),
  delegationEnd: isoHoursFromNow(24),
  delegationReason: '',
});

export default function AdmissionsGovernanceConfiguration() {
  const { academicYearId } = useEnrollmentWorkspace();
  const skip = !academicYearId;
  const policies = useGetAdmissionCrmRetentionPoliciesQuery(
    { academicYearId: academicYearId || '' },
    { skip }
  );
  const privacy = useGetAdmissionCrmPrivacyRequestsQuery(
    { academicYearId: academicYearId || '' },
    { skip }
  );
  const exportsQuery = useGetAdmissionCrmExportsQuery(
    { academicYearId: academicYearId || '' },
    { skip }
  );
  const schedules = useGetAdmissionCrmReportSchedulesQuery(
    { academicYearId: academicYearId || '' },
    { skip }
  );
  const delegations = useGetAdmissionCrmDelegationsQuery(
    { academicYearId: academicYearId || '' },
    { skip }
  );
  const forecast = useGetAdmissionCrmAdvisoryForecastQuery(
    { academicYearId: academicYearId || '' },
    { skip }
  );

  const [createPolicy, createPolicyState] = useCreateAdmissionCrmRetentionPolicyMutation();
  const [submitPolicy] = useSubmitAdmissionCrmRetentionPolicyMutation();
  const [publishPolicy] = usePublishAdmissionCrmRetentionPolicyMutation();
  const [decidePrivacy] = useDecideAdmissionCrmPrivacyRequestMutation();
  const [completePrivacy] = useCompleteAdmissionCrmPrivacyRequestMutation();
  const [requestExport, requestExportState] = useRequestAdmissionCrmExportMutation();
  const [downloadExport] = useDownloadAdmissionCrmExportMutation();
  const [createSchedule, createScheduleState] = useCreateAdmissionCrmReportScheduleMutation();
  const [setScheduleActive] = useSetAdmissionCrmReportScheduleActiveMutation();
  const [runDueSchedules, runDueSchedulesState] = useRunDueAdmissionCrmReportSchedulesMutation();
  const [createDelegation, createDelegationState] = useCreateAdmissionCrmDelegationMutation();
  const [cancelDelegation] = useCancelAdmissionCrmDelegationMutation();

  const [defaults] = useState(createGovernanceDefaults);
  const [policyCode, setPolicyCode] = useState(defaults.policyCode);
  const [policyName, setPolicyName] = useState(defaults.policyName);
  const [retainDays, setRetainDays] = useState(defaults.retainDays);
  const [authorityNote, setAuthorityNote] = useState(defaults.authorityNote);
  const [reportType, setReportType] = useState(defaults.reportType);
  const [scheduleName, setScheduleName] = useState(defaults.scheduleName);
  const [frequency, setFrequency] = useState(defaults.frequency);
  const [nextRunAt, setNextRunAt] = useState(defaults.nextRunAt);
  const [scheduleRecipient, setScheduleRecipient] =
    useState<AdmissionCrmStaffLookupDto | null>(null);
  const [delegator, setDelegator] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [delegate, setDelegate] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [staffSearch, setStaffSearch] = useState('');
  const [debouncedStaffSearch, setDebouncedStaffSearch] = useState('');
  const [queueType, setQueueType] = useState(defaults.queueType);
  const [delegationStart, setDelegationStart] = useState(defaults.delegationStart);
  const [delegationEnd, setDelegationEnd] = useState(defaults.delegationEnd);
  const [delegationReason, setDelegationReason] = useState(defaults.delegationReason);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedStaffSearch(staffSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [staffSearch]);

  const delegationStaffIds = useMemo(
    () =>
      [
        delegator?.id,
        delegate?.id,
        scheduleRecipient?.id,
        ...(schedules.data || [])
          .map((item) =>
            item.destination.startsWith('user:') ? item.destination.slice('user:'.length) : undefined
          ),
        ...(delegations.data || []).flatMap((item) => [item.delegatorUserId, item.delegateUserId]),
      ]
        .filter((id): id is string => Boolean(id))
        .slice(0, 25)
        .join(','),
    [delegate?.id, delegations.data, delegator?.id, scheduleRecipient?.id, schedules.data]
  );
  const staff = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedStaffSearch || undefined,
      ids: delegationStaffIds || undefined,
      maxResultCount: 25,
    },
    { skip }
  );
  const staffOptions = useMemo(
    () =>
      Array.from(
        new Map(
          [delegator, delegate, scheduleRecipient, ...(staff.data || [])]
            .filter((item): item is AdmissionCrmStaffLookupDto => Boolean(item))
            .map((item) => [item.id, item])
        ).values()
      ),
    [delegate, delegator, scheduleRecipient, staff.data]
  );
  const staffById = useMemo(
    () => new Map(staffOptions.map((item) => [item.id, item])),
    [staffOptions]
  );

  const resetPolicyEditor = () => {
    setPolicyCode(defaults.policyCode);
    setPolicyName(defaults.policyName);
    setRetainDays(defaults.retainDays);
    setAuthorityNote(defaults.authorityNote);
  };
  const resetScheduleEditor = () => {
    setScheduleName(defaults.scheduleName);
    setFrequency(defaults.frequency);
    setNextRunAt(defaults.nextRunAt);
    setScheduleRecipient(null);
  };
  const resetDelegationEditor = () => {
    setDelegator(null);
    setDelegate(null);
    setStaffSearch('');
    setQueueType(defaults.queueType);
    setDelegationStart(defaults.delegationStart);
    setDelegationEnd(defaults.delegationEnd);
    setDelegationReason(defaults.delegationReason);
  };
  const policyDirty =
    policyCode !== defaults.policyCode ||
    policyName !== defaults.policyName ||
    retainDays !== defaults.retainDays ||
    authorityNote !== defaults.authorityNote;
  const scheduleDirty =
    scheduleName !== defaults.scheduleName ||
    frequency !== defaults.frequency ||
    nextRunAt !== defaults.nextRunAt ||
    Boolean(scheduleRecipient);
  const delegationDirty =
    Boolean(delegator || delegate) ||
    queueType !== defaults.queueType ||
    delegationStart !== defaults.delegationStart ||
    delegationEnd !== defaults.delegationEnd ||
    delegationReason !== defaults.delegationReason;

  useEnrollmentSettingsDirtyState({
    source: 'governance-editors',
    dirty: policyDirty || scheduleDirty || delegationDirty,
    onDiscard: () => {
      resetPolicyEditor();
      resetScheduleEditor();
      resetDelegationEditor();
    },
  });

  const busy =
    policies.isFetching ||
    privacy.isFetching ||
    exportsQuery.isFetching ||
    schedules.isFetching ||
    delegations.isFetching ||
    staff.isFetching;
  const hasQueryError =
    policies.isError ||
    privacy.isError ||
    exportsQuery.isError ||
    schedules.isError ||
    delegations.isError ||
    forecast.isError ||
    staff.isError;
  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message: success });
      return true;
    } catch (error) {
      shikshaMitraToast.error({ message: errorMessage(error) });
      return false;
    }
  };

  const savePolicy = async () => {
    if (!academicYearId) return;
    const created = await run(
      () =>
        createPolicy({
          academicYearId,
          code: policyCode.trim().toUpperCase(),
          name: policyName.trim(),
          category: AdmissionCrmRetentionCategory.UnsuccessfulApplicant,
          action: AdmissionCrmRetentionAction.Anonymize,
          retainDays,
          authorityNote: authorityNote.trim(),
        }).unwrap(),
      'Retention policy draft created.'
    );
    if (created) resetPolicyEditor();
  };

  const saveSchedule = async () => {
    if (!academicYearId) return;
    const created = await run(
      () =>
        createSchedule({
          academicYearId,
          name: scheduleName.trim(),
          reportType,
          frequency,
          destination: scheduleRecipient
            ? `user:${scheduleRecipient.id}`
            : 'manual:secure-export-queue',
          nextRunAt: new Date(nextRunAt).toISOString(),
        }).unwrap(),
      scheduleRecipient
        ? 'Scheduled coordinator report delivery created.'
        : 'Manual report schedule created.'
    );
    if (created) resetScheduleEditor();
  };

  const saveDelegation = async () => {
    if (!academicYearId || !delegator || !delegate) return;
    const created = await run(
      () =>
        createDelegation({
          academicYearId,
          delegatorUserId: delegator.id,
          delegateUserId: delegate.id,
          queueTypes: [queueType],
          startsAt: new Date(delegationStart).toISOString(),
          endsAt: new Date(delegationEnd).toISOString(),
          reason: delegationReason.trim(),
        }).unwrap(),
      'Delegation created.'
    );
    if (created) resetDelegationEditor();
  };

  const download = async (exportId: string) => {
    try {
      const result = await downloadExport({ exportId }).unwrap();
      downloadAdmissionExportFile(result);
    } catch (error) {
      shikshaMitraToast.error({ message: errorMessage(error) });
    }
  };

  const queueOptions = useMemo(
    () => Object.entries(queueLabels).map(([value, label]) => ({ value: Number(value), label })),
    []
  );

  if (!academicYearId)
    return (
      <Alert severity="warning">Select an academic year to manage Enrollment governance.</Alert>
    );

  if (hasQueryError) {
    return (
      <Alert
        severity="error"
        action={
          <LoadingButton
            size="small"
            color="inherit"
            onClick={() => {
              policies.refetch();
              privacy.refetch();
              exportsQuery.refetch();
              schedules.refetch();
              delegations.refetch();
              forecast.refetch();
              staff.refetch();
            }}
          >
            Retry
          </LoadingButton>
        }
      >
        Some governance settings could not be loaded.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.5}>
      {busy && <LinearProgress />}
      <Alert severity="info">
        Retention and privacy actions are governed workflows. The ERP records decisions and blockers
        but does not claim automatic legal compliance.
      </Alert>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle1">Retention policies</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              size="small"
              label="Code"
              value={policyCode}
              onChange={(event) => setPolicyCode(event.target.value)}
            />
            <TextField
              size="small"
              label="Name"
              value={policyName}
              onChange={(event) => setPolicyName(event.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="number"
              label="Retain days"
              value={retainDays}
              onChange={(event) => setRetainDays(Number(event.target.value))}
            />
          </Stack>
          <TextField
            size="small"
            label="Authority and rationale"
            value={authorityNote}
            onChange={(event) => setAuthorityNote(event.target.value)}
            multiline
            minRows={2}
          />
          <LoadingButton
            variant="contained"
            loading={createPolicyState.isLoading}
            disabled={!policyCode.trim() || !policyName.trim() || !authorityNote.trim()}
            onClick={savePolicy}
          >
            Create draft
          </LoadingButton>
          <Divider />
          {(policies.data || []).map((policy) => (
            <Stack
              key={policy.id}
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ md: 'center' }}
            >
              <Stack sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {policy.code} · {policy.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {policy.retainDays} days · {policy.authorityNote}
                </Typography>
              </Stack>
              <Chip size="small" label={AdmissionCrmGovernedConfigurationStatus[policy.status]} />
              {policy.status === AdmissionCrmGovernedConfigurationStatus.Draft && (
                <Button
                  size="small"
                  startIcon={<Send />}
                  onClick={() =>
                    run(
                      () => submitPolicy({ policyId: policy.id }).unwrap(),
                      'Policy submitted for independent approval.'
                    )
                  }
                >
                  Submit
                </Button>
              )}
              {policy.status === AdmissionCrmGovernedConfigurationStatus.ApprovalPending && (
                <Button
                  size="small"
                  startIcon={<Publish />}
                  onClick={() =>
                    run(() => publishPolicy({ policyId: policy.id }).unwrap(), 'Policy published.')
                  }
                >
                  Publish
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1">Privacy request queue</Typography>
          {(privacy.data || []).map((request) => (
            <Stack
              key={request.id}
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ md: 'center' }}
            >
              <Stack sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {request.type === 0
                    ? 'Anonymization'
                    : request.type === 1
                      ? 'Deletion review'
                      : 'Consent withdrawal'}{' '}
                  · lead {request.leadId.slice(0, 8)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {request.reason} · {request.preview.retentionBlockers.length} blocker(s)
                </Typography>
              </Stack>
              <Chip size="small" label={AdmissionCrmPrivacyRequestStatus[request.status]} />
              {request.status === AdmissionCrmPrivacyRequestStatus.ApprovalPending && (
                <>
                  <Button
                    size="small"
                    onClick={() =>
                      run(
                        () =>
                          decidePrivacy({
                            requestId: request.id,
                            approve: true,
                            reason: 'Approved after retention and authority review.',
                          }).unwrap(),
                        'Privacy request approved.'
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      run(
                        () =>
                          decidePrivacy({
                            requestId: request.id,
                            approve: false,
                            reason: 'Rejected after retention and authority review.',
                          }).unwrap(),
                        'Privacy request rejected.'
                      )
                    }
                  >
                    Reject
                  </Button>
                </>
              )}
              {request.status === AdmissionCrmPrivacyRequestStatus.Approved && (
                <Button
                  size="small"
                  startIcon={<PlayArrow />}
                  onClick={() =>
                    run(
                      () =>
                        completePrivacy({
                          requestId: request.id,
                          executionReference: `MANUAL-${Date.now()}`,
                        }).unwrap(),
                      'Manual privacy execution recorded.'
                    )
                  }
                >
                  Record completion
                </Button>
              )}
            </Stack>
          ))}
          {!privacy.isFetching && !privacy.data?.length && (
            <Typography variant="body2" color="text.secondary">
              No privacy requests are awaiting review.
            </Typography>
          )}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="center">
            <Typography variant="subtitle1" sx={{ flex: 1 }}>
              Traceable exports and report schedules
            </Typography>
            <LoadingButton
              size="small"
              loading={runDueSchedulesState.isLoading}
              startIcon={<PlayArrow />}
              onClick={() =>
                run(
                  () => runDueSchedules({ academicYearId }).unwrap(),
                  'Due report schedules processed.'
                )
              }
            >
              Run due
            </LoadingButton>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              select
              size="small"
              label="Report"
              value={reportType}
              onChange={(event) => setReportType(Number(event.target.value))}
              sx={{ minWidth: 220 }}
            >
              {Object.entries(reportLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <LoadingButton
              loading={requestExportState.isLoading}
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() =>
                run(
                  () => requestExport({ academicYearId, reportType, expiresInHours: 24 }).unwrap(),
                  'Expiring export prepared.'
                )
              }
            >
              Prepare export
            </LoadingButton>
          </Stack>
          {(exportsQuery.data || []).slice(0, 10).map((item) => (
            <Stack key={item.id} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ flex: 1 }}>
                {item.fileName}
              </Typography>
              <Chip size="small" label={`Expires ${new Date(item.expiresAt).toLocaleString()}`} />
              <Button size="small" startIcon={<Download />} onClick={() => download(item.id)}>
                Download
              </Button>
            </Stack>
          ))}
          <Divider />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              size="small"
              label="Schedule name"
              value={scheduleName}
              onChange={(event) => setScheduleName(event.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              select
              size="small"
              label="Frequency"
              value={frequency}
              onChange={(event) => setFrequency(Number(event.target.value))}
            >
              {[0, 1, 2].map((value) => (
                <MenuItem key={value} value={value}>
                  {AdmissionCrmReportFrequency[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="datetime-local"
              label="Next run"
              value={nextRunAt}
              onChange={(event) => setNextRunAt(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Autocomplete
              size="small"
              options={staffOptions.filter((item) => Boolean(item.email))}
              value={scheduleRecipient}
              loading={staff.isFetching}
              filterOptions={(options) => options}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => `${option.displayName} (${option.email})`}
              onInputChange={(_, value, reason) => {
                if (reason === 'input' || reason === 'clear') setStaffSearch(value);
              }}
              onChange={(_, value) => setScheduleRecipient(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Email coordinator (optional)"
                  helperText="Leave empty to keep the export in the secure manual queue."
                />
              )}
              sx={{ minWidth: 280 }}
            />
            <LoadingButton
              loading={createScheduleState.isLoading}
              disabled={!scheduleName.trim()}
              onClick={saveSchedule}
            >
              Schedule
            </LoadingButton>
          </Stack>
          {(schedules.data || []).map((item) => (
            <Stack key={item.id} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ flex: 1 }}>
                {item.name} · {reportLabels[item.reportType]}
              </Typography>
              <Chip
                size="small"
                label={
                  item.destination.startsWith('user:')
                    ? `Email: ${staffById.get(item.destination.slice('user:'.length))?.displayName || 'Coordinator'}`
                    : 'Secure export queue'
                }
              />
              <Switch
                size="small"
                checked={item.isActive}
                inputProps={{ 'aria-label': `${item.name} schedule active` }}
                onChange={(_, active) =>
                  run(
                    () => setScheduleActive({ scheduleId: item.id, active }).unwrap(),
                    active ? 'Schedule enabled.' : 'Schedule paused.'
                  )
                }
              />
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle1">Temporary work delegation</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <Autocomplete
              size="small"
              options={staffOptions}
              value={delegator}
              loading={staff.isFetching}
              filterOptions={(options) => options}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => `${option.displayName} (${option.userName})`}
              onInputChange={(_, value, reason) => {
                if (reason === 'input' || reason === 'clear') setStaffSearch(value);
              }}
              onChange={(_, value) => setDelegator(value)}
              renderInput={(params) => <TextField {...params} label="Delegating staff" />}
              sx={{ minWidth: 240 }}
            />
            <Autocomplete
              size="small"
              options={staffOptions}
              value={delegate}
              loading={staff.isFetching}
              filterOptions={(options) => options}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => `${option.displayName} (${option.userName})`}
              onInputChange={(_, value, reason) => {
                if (reason === 'input' || reason === 'clear') setStaffSearch(value);
              }}
              onChange={(_, value) => setDelegate(value)}
              renderInput={(params) => <TextField {...params} label="Delegate staff" />}
              sx={{ minWidth: 240 }}
            />
            <TextField
              select
              size="small"
              label="Queue"
              value={queueType}
              onChange={(event) => setQueueType(Number(event.target.value))}
            >
              {queueOptions.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              size="small"
              type="datetime-local"
              label="Starts"
              value={delegationStart}
              onChange={(event) => setDelegationStart(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="datetime-local"
              label="Ends"
              value={delegationEnd}
              onChange={(event) => setDelegationEnd(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Reason"
              value={delegationReason}
              onChange={(event) => setDelegationReason(event.target.value)}
              sx={{ flex: 1 }}
            />
            <LoadingButton
              loading={createDelegationState.isLoading}
              disabled={!delegator || !delegate || !delegationReason.trim()}
              onClick={saveDelegation}
            >
              Delegate
            </LoadingButton>
          </Stack>
          {(delegations.data || []).map((item) => (
            <Stack key={item.id} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ flex: 1 }}>
                {staffById.get(item.delegatorUserId)?.displayName || 'Unknown staff'} →{' '}
                {staffById.get(item.delegateUserId)?.displayName || 'Unknown staff'} ·{' '}
                {queueLabels[item.queueTypes[0]] || 'Admissions queue'}
              </Typography>
              <Chip size="small" label={AdmissionCrmDelegationStatus[item.status]} />
              {item.status !== AdmissionCrmDelegationStatus.Cancelled &&
                item.status !== AdmissionCrmDelegationStatus.Expired && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() =>
                      run(
                        () => cancelDelegation({ delegationId: item.id }).unwrap(),
                        'Delegation cancelled.'
                      )
                    }
                  >
                    Cancel
                  </Button>
                )}
            </Stack>
          ))}
        </Stack>
      </Paper>

      {forecast.data && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">Advisory demand outlook</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip label={`${forecast.data.currentOpenLeadCount} open leads`} />
              <Chip
                label={`${forecast.data.projectedAdditionalAcceptedOffers} projected acceptances`}
              />
              <Chip
                label={`${forecast.data.projectedAdditionalActivations} projected activations`}
              />
              <Chip color="info" label={forecast.data.confidence} />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Descriptive current-cycle projection only. It cannot make or change an admission
              decision and does not use protected attributes.
            </Typography>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
