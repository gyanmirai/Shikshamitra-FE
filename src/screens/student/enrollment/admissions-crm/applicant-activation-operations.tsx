'use client';

import type { AdmissionCrmActivationPreviewDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Gavel, Preview, Approval, PlayArrow, CancelOutlined } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmActivationStatus,
  AdmissionCrmNumberSeriesStatus,
  AdmissionCrmServiceHandoffType,
  AdmissionCrmServiceHandoffStatus,
  useGetAdmissionCrmActivationQuery,
  useGetAdmissionCrmNumberSeriesQuery,
  useGetAdmissionCrmPlacementOptionsQuery,
  useApproveAdmissionCrmActivationMutation,
  useExecuteAdmissionCrmActivationMutation,
  usePreviewAdmissionCrmActivationMutation,
  useRequestAdmissionCrmActivationMutation,
  useUpdateAdmissionCrmServiceHandoffMutation,
  useAssignManualAdmissionCrmIdentifierMutation,
  useApproveAdmissionCrmActivationCancellationMutation,
  useGetAdmissionCrmActivationCancellationPreviewQuery,
  useRequestAdmissionCrmActivationCancellationMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnumLabel } from './enrollment-display';
import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';
import {
  ApplicantSwitchRow,
  ApplicantEmptyState,
  ApplicantInlineNotice,
} from './applicant-workspace-primitives';

type Props = { leadId: string; academicYearId: string };
const statusLabels = [
  'Draft',
  'Approval pending',
  'Approved',
  'In progress',
  'Repair required',
  'First-day ready',
  'Cancelled',
  'Cancellation pending',
];
const serviceOptions = [
  AdmissionCrmServiceHandoffType.Transport,
  AdmissionCrmServiceHandoffType.Hostel,
  AdmissionCrmServiceHandoffType.Library,
  AdmissionCrmServiceHandoffType.HealthSupport,
  AdmissionCrmServiceHandoffType.Meal,
  AdmissionCrmServiceHandoffType.Uniform,
  AdmissionCrmServiceHandoffType.Device,
];

export function ApplicantActivationOperations({ leadId, academicYearId }: Props) {
  const activation = useGetAdmissionCrmActivationQuery({ leadId });
  const placements = useGetAdmissionCrmPlacementOptionsQuery({ academicYearId });
  const series = useGetAdmissionCrmNumberSeriesQuery({ academicYearId });
  const [placementId, setPlacementId] = useState('');
  const [activationFormOpen, setActivationFormOpen] = useState(false);
  const [seriesId, setSeriesId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [gender, setGender] = useState(0);
  const [requireStudentAccount, setRequireStudentAccount] = useState(true);
  const [requireGuardianAccount, setRequireGuardianAccount] = useState(true);
  const [selectedServices, setSelectedServices] = useState<AdmissionCrmServiceHandoffType[]>([]);
  const [serviceConsent, setServiceConsent] = useState(false);
  const [handoffReference, setHandoffReference] = useState('');
  const [handoffReason, setHandoffReason] = useState('');
  const [manualIdentifierSequence, setManualIdentifierSequence] = useState('');
  const [manualIdentifierValue, setManualIdentifierValue] = useState('');
  const [manualIdentifierReason, setManualIdentifierReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [previewData, setPreviewData] = useState<AdmissionCrmActivationPreviewDto>();
  useApplicantWorkspaceDirtyState(`activation-setup-${leadId}`, activationFormOpen);
  const [preview, previewState] = usePreviewAdmissionCrmActivationMutation();
  const [request, requestState] = useRequestAdmissionCrmActivationMutation();
  const [approve, approveState] = useApproveAdmissionCrmActivationMutation();
  const [execute, executeState] = useExecuteAdmissionCrmActivationMutation();
  const [requestCancellation, requestCancellationState] =
    useRequestAdmissionCrmActivationCancellationMutation();
  const [approveCancellation, approveCancellationState] =
    useApproveAdmissionCrmActivationCancellationMutation();
  const [updateHandoff, updateHandoffState] = useUpdateAdmissionCrmServiceHandoffMutation();
  const [assignManualIdentifier, manualIdentifierState] =
    useAssignManualAdmissionCrmIdentifierMutation();
  const current = activation.data;
  const cancellationPreview = useGetAdmissionCrmActivationCancellationPreviewQuery(
    { activationId: current?.id || '' },
    {
      skip:
        !current ||
        ![
          AdmissionCrmActivationStatus.FirstDayReady,
          AdmissionCrmActivationStatus.CancellationPending,
        ].includes(current.status),
    }
  );
  const selectedPlacement = placements.data?.find((x) => x.divisionId === placementId);
  const body = selectedPlacement
    ? {
        educationBoardId: selectedPlacement.educationBoardId,
        academicMediumId: selectedPlacement.academicMediumId,
        academicMediumStageId: selectedPlacement.academicMediumStageId,
        standardId: selectedPlacement.standardId,
        divisionId: selectedPlacement.divisionId,
        grNumberSeriesId: seriesId,
        rollNumber: rollNumber ? Number(rollNumber) : null,
        requireStudentAccount,
        requireGuardianAccount,
        serviceHandoffs: selectedServices.map((type) => ({
          type,
          destinationModule: AdmissionCrmServiceHandoffType[type],
          consentConfirmed: serviceConsent,
          payload: { interest: 'Requested during admission activation' },
        })),
      }
    : null;

  const run = async <T,>(action: () => Promise<T>, message: string) => {
    try {
      const value = await action();
      shikshaMitraToast.success({ message });
      return value;
    } catch {
      shikshaMitraToast.error({
        message: 'The activation change could not be saved. Review the fields and try again.',
      });
      return undefined;
    }
  };
  const runPreview = async () => {
    if (!body) return;
    const value = await run(
      () => preview({ leadId, body }).unwrap(),
      'Activation readiness evaluated.'
    );
    if (value) setPreviewData(value);
  };

  return (
    <Box component="section">
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">Student activation</Typography>
          {current && (
            <Chip
              size="small"
              color={
                current.status === AdmissionCrmActivationStatus.FirstDayReady
                  ? 'success'
                  : current.status === AdmissionCrmActivationStatus.RepairRequired
                    ? 'error'
                    : 'default'
              }
              label={statusLabels[current.status]}
            />
          )}
        </Stack>
        {(placements.isFetching || series.isFetching || activation.isFetching) && (
          <LinearProgress />
        )}
        {!current && (
          <>
            <ApplicantEmptyState
              title="Activation has not started"
              description="Review academic placement, identifiers, account access, and optional handoffs before requesting approval."
              action={
                !activationFormOpen ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setActivationFormOpen(true)}
                  >
                    Prepare activation
                  </Button>
                ) : undefined
              }
            />
            {activationFormOpen ? (
              <>
                <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                  <TextField
                    size="small"
                    select
                    fullWidth
                    label="Academic placement"
                    value={placementId}
                    onChange={(e) => {
                      setPlacementId(e.target.value);
                      setPreviewData(undefined);
                    }}
                  >
                    <MenuItem value="">Select placement</MenuItem>
                    {(placements.data || []).map((x) => (
                      <MenuItem key={x.divisionId} value={x.divisionId}>
                        {x.boardName} / {x.mediumName} / {x.stageName} / {x.standardName} /{' '}
                        {x.divisionName} ({x.divisionStrength})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    select
                    label="GR number series"
                    value={seriesId}
                    onChange={(e) => {
                      setSeriesId(e.target.value);
                      setPreviewData(undefined);
                    }}
                    sx={{ minWidth: 220 }}
                  >
                    <MenuItem value="">Select series</MenuItem>
                    {(series.data || [])
                      .filter((x) => x.status === AdmissionCrmNumberSeriesStatus.Published)
                      .map((x) => (
                        <MenuItem key={x.id} value={x.id}>
                          {x.name} - {x.nextPreview}
                        </MenuItem>
                      ))}
                  </TextField>
                  <TextField
                    size="small"
                    type="number"
                    label="Roll number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                  <TextField
                    size="small"
                    select
                    label="Gender"
                    value={gender}
                    onChange={(e) => setGender(Number(e.target.value))}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value={0}>Male</MenuItem>
                    <MenuItem value={1}>Female</MenuItem>
                  </TextField>
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    columnGap: 2,
                  }}
                >
                  <ApplicantSwitchRow
                    label="Student account access"
                    description="Create or link student access during activation."
                    checked={requireStudentAccount}
                    onChange={setRequireStudentAccount}
                  />
                  <ApplicantSwitchRow
                    label="Guardian account access"
                    description="Create or link guardian access during activation."
                    checked={requireGuardianAccount}
                    onChange={setRequireGuardianAccount}
                  />
                </Box>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Optional service interests
                  </Typography>
                  <Stack direction="row" gap={0.5} flexWrap="wrap">
                    {serviceOptions.map((type) => {
                      const selected = selectedServices.includes(type);
                      return (
                        <Chip
                          key={type}
                          clickable
                          size="small"
                          color={selected ? 'primary' : 'default'}
                          variant={selected ? 'filled' : 'outlined'}
                          label={formatEnumLabel(AdmissionCrmServiceHandoffType[type])}
                          aria-pressed={selected}
                          onClick={() =>
                            setSelectedServices((items) =>
                              selected ? items.filter((item) => item !== type) : [...items, type]
                            )
                          }
                        />
                      );
                    })}
                  </Stack>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={serviceConsent}
                        disabled={!selectedServices.length}
                        onChange={(event) => setServiceConsent(event.target.checked)}
                      />
                    }
                    label="Consent confirmed for minimum-data service handoff"
                  />
                </Stack>
                <Stack direction="row" gap={1}>
                  <LoadingButton
                    variant="outlined"
                    startIcon={<Preview />}
                    loading={previewState.isLoading}
                    disabled={!body || !seriesId}
                    onClick={runPreview}
                  >
                    Preview readiness
                  </LoadingButton>
                  <LoadingButton
                    variant="contained"
                    startIcon={<Approval />}
                    loading={requestState.isLoading}
                    disabled={!previewData?.isReady || !body}
                    onClick={() =>
                      body &&
                      run(
                        () => request({ leadId, body: { ...body, gender } }).unwrap(),
                        'Activation submitted for approval.'
                      )
                    }
                  >
                    Request activation
                  </LoadingButton>
                </Stack>
                {previewData && (
                  <Stack spacing={0.5}>
                    <Alert severity={previewData.isReady ? 'success' : 'warning'}>
                      {previewData.isReady
                        ? `Ready to activate with ${previewData.grNumberPreview}.`
                        : 'Resolve blocking readiness items before activation.'}
                    </Alert>
                    {previewData.items.map((item) => (
                      <Stack key={item.key} direction="row" justifyContent="space-between" gap={1}>
                        <Typography variant="body2">
                          {item.label}
                          <Typography display="block" variant="caption" color="text.secondary">
                            {item.detail}
                          </Typography>
                        </Typography>
                        <Chip
                          size="small"
                          color={item.status === 1 ? 'success' : 'error'}
                          label={item.status === 1 ? 'Passed' : 'Failed'}
                        />
                      </Stack>
                    ))}
                  </Stack>
                )}
                <Button
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={() => setActivationFormOpen(false)}
                >
                  Cancel activation setup
                </Button>
              </>
            ) : null}
          </>
        )}
        {current && (
          <>
            <Typography variant="body2">
              {current.activationReference}
              <Typography display="block" variant="caption" color="text.secondary">
                Student: {current.studentId || 'Pending'} - attempt {current.attemptCount}
              </Typography>
            </Typography>
            {current.status === AdmissionCrmActivationStatus.ApprovalPending && (
              <LoadingButton
                startIcon={<Approval />}
                loading={approveState.isLoading}
                onClick={() =>
                  run(() => approve({ activationId: current.id }).unwrap(), 'Activation approved.')
                }
              >
                Approve
              </LoadingButton>
            )}
            {current.identifiers.length === 0 &&
              [
                AdmissionCrmActivationStatus.ApprovalPending,
                AdmissionCrmActivationStatus.Approved,
              ].includes(current.status) && (
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                  <TextField
                    size="small"
                    type="number"
                    label="Manual GR numeric sequence"
                    value={manualIdentifierSequence}
                    onChange={(event) => setManualIdentifierSequence(event.target.value)}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Manual GR display value"
                    value={manualIdentifierValue}
                    onChange={(event) => setManualIdentifierValue(event.target.value)}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Manual assignment reason"
                    value={manualIdentifierReason}
                    onChange={(event) => setManualIdentifierReason(event.target.value)}
                  />
                  <LoadingButton
                    variant="outlined"
                    loading={manualIdentifierState.isLoading}
                    disabled={
                      !manualIdentifierSequence ||
                      !manualIdentifierValue.trim() ||
                      manualIdentifierReason.trim().length < 3
                    }
                    onClick={() =>
                      run(
                        () =>
                          assignManualIdentifier({
                            activationId: current.id,
                            numberSeriesId: current.grNumberSeriesId,
                            sequence: Number(manualIdentifierSequence),
                            value: manualIdentifierValue.trim(),
                            reason: manualIdentifierReason.trim(),
                          }).unwrap(),
                        'Manual GR number assigned with audit reason.'
                      )
                    }
                  >
                    Assign GR
                  </LoadingButton>
                </Stack>
              )}
            {(current.status === AdmissionCrmActivationStatus.Approved ||
              current.status === AdmissionCrmActivationStatus.RepairRequired) && (
              <LoadingButton
                variant="contained"
                startIcon={<PlayArrow />}
                loading={executeState.isLoading}
                onClick={() =>
                  run(
                    () => execute({ activationId: current.id }).unwrap(),
                    current.status === AdmissionCrmActivationStatus.RepairRequired
                      ? 'Activation repair attempted.'
                      : 'Activation executed.'
                  )
                }
              >
                {current.status === AdmissionCrmActivationStatus.RepairRequired
                  ? 'Retry repair'
                  : 'Activate student'}
              </LoadingButton>
            )}
            {current.repairReason && (
              <Alert severity="error">
                {current.repairStep}: {current.repairReason}
              </Alert>
            )}
            {[
              AdmissionCrmActivationStatus.FirstDayReady,
              AdmissionCrmActivationStatus.CancellationPending,
            ].includes(current.status) && (
              <Stack spacing={1}>
                {cancellationPreview.data ? (
                  cancellationPreview.data.canCancel ? (
                    <ApplicantInlineNotice>
                      This activation is inside the controlled cancellation window.
                    </ApplicantInlineNotice>
                  ) : (
                    <Alert severity="warning">
                      Cancellation is blocked. Use Student Records when the safe window or activity
                      checks fail.
                    </Alert>
                  )
                ) : null}
                {cancellationPreview.data?.checks.map((check) => (
                  <Typography
                    key={check.key}
                    variant="caption"
                    color={check.passed ? 'success.main' : 'error.main'}
                  >
                    {check.detail}
                  </Typography>
                ))}
                {current.status === AdmissionCrmActivationStatus.FirstDayReady && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Cancellation reason"
                      value={cancellationReason}
                      onChange={(event) => setCancellationReason(event.target.value)}
                    />
                    <LoadingButton
                      color="error"
                      variant="outlined"
                      startIcon={<CancelOutlined />}
                      loading={requestCancellationState.isLoading}
                      disabled={
                        !cancellationPreview.data?.canCancel || cancellationReason.trim().length < 3
                      }
                      onClick={() =>
                        run(
                          () =>
                            requestCancellation({
                              activationId: current.id,
                              reason: cancellationReason.trim(),
                            }).unwrap(),
                          'Cancellation submitted for approval.'
                        )
                      }
                    >
                      Request cancellation
                    </LoadingButton>
                  </Stack>
                )}
                {current.status === AdmissionCrmActivationStatus.CancellationPending && (
                  <LoadingButton
                    color="error"
                    variant="contained"
                    startIcon={<Gavel />}
                    loading={approveCancellationState.isLoading}
                    disabled={!cancellationPreview.data?.canCancel}
                    onClick={() =>
                      run(
                        () => approveCancellation({ activationId: current.id }).unwrap(),
                        'Activation cancelled.'
                      )
                    }
                  >
                    Approve cancellation
                  </LoadingButton>
                )}
              </Stack>
            )}
            {current.identifiers.map((x) => (
              <Chip
                key={x.id}
                size="small"
                label={`GR ${x.value}${x.isManual ? ' (manual)' : ''}`}
                sx={{ alignSelf: 'flex-start' }}
              />
            ))}
            {current.serviceHandoffs.length > 0 && (
              <Stack spacing={0.75}>
                <Typography variant="subtitle2">Optional service handoffs</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Owning module reference"
                    value={handoffReference}
                    onChange={(event) => setHandoffReference(event.target.value)}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Failure or cancellation reason"
                    value={handoffReason}
                    onChange={(event) => setHandoffReason(event.target.value)}
                  />
                </Stack>
                {current.serviceHandoffs.map((handoff) => (
                  <Stack
                    key={handoff.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    gap={1}
                    alignItems={{ sm: 'center' }}
                  >
                    <Chip
                      size="small"
                      label={`${AdmissionCrmServiceHandoffType[handoff.type]}: ${AdmissionCrmServiceHandoffStatus[handoff.status]}`}
                      color={
                        handoff.status === AdmissionCrmServiceHandoffStatus.Acknowledged
                          ? 'success'
                          : handoff.status === AdmissionCrmServiceHandoffStatus.Failed
                            ? 'error'
                            : 'default'
                      }
                    />
                    {[
                      AdmissionCrmServiceHandoffStatus.Pending,
                      AdmissionCrmServiceHandoffStatus.Failed,
                    ].includes(handoff.status) && (
                      <LoadingButton
                        size="small"
                        loading={updateHandoffState.isLoading}
                        onClick={() =>
                          run(
                            () =>
                              updateHandoff({
                                handoffId: handoff.id,
                                status: AdmissionCrmServiceHandoffStatus.Dispatched,
                                externalReference: handoffReference.trim() || undefined,
                              }).unwrap(),
                            'Service handoff dispatched.'
                          )
                        }
                      >
                        Dispatch
                      </LoadingButton>
                    )}
                    {handoff.status === AdmissionCrmServiceHandoffStatus.Dispatched && (
                      <LoadingButton
                        size="small"
                        loading={updateHandoffState.isLoading}
                        disabled={!handoffReference.trim()}
                        onClick={() =>
                          run(
                            () =>
                              updateHandoff({
                                handoffId: handoff.id,
                                status: AdmissionCrmServiceHandoffStatus.Acknowledged,
                                externalReference: handoffReference.trim(),
                              }).unwrap(),
                            'Service handoff acknowledged.'
                          )
                        }
                      >
                        Acknowledge
                      </LoadingButton>
                    )}
                    {![
                      AdmissionCrmServiceHandoffStatus.Acknowledged,
                      AdmissionCrmServiceHandoffStatus.Cancelled,
                    ].includes(handoff.status) && (
                      <LoadingButton
                        size="small"
                        color="error"
                        loading={updateHandoffState.isLoading}
                        disabled={!handoffReason.trim()}
                        onClick={() =>
                          run(
                            () =>
                              updateHandoff({
                                handoffId: handoff.id,
                                status: AdmissionCrmServiceHandoffStatus.Failed,
                                reason: handoffReason.trim(),
                              }).unwrap(),
                            'Service handoff marked failed.'
                          )
                        }
                      >
                        Mark failed
                      </LoadingButton>
                    )}
                    {handoff.lastError && (
                      <Typography variant="caption" color="error.main">
                        {handoff.lastError}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
            {current.steps.map((x) => (
              <Typography key={x.key} variant="caption">
                {x.key}: {x.detail}
              </Typography>
            ))}
          </>
        )}
      </Stack>
    </Box>
  );
}
