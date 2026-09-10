'use client';

import type { RootState } from 'src/redux/store';
import type { StudentOnboardingStepStatus } from 'src/redux/student/admissions/student-onboarding-api';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  Checkbox,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  CardContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useGetStudentOnboardingCaseQuery,
  useCancelStudentOnboardingMutation,
  useActivateStudentOnboardingMutation,
  useGetStudentOnboardingHandoffsQuery,
  useUpdateStudentOnboardingStepMutation,
  useAssignStudentOnboardingOwnerMutation,
  useSetStudentOnboardingPlacementMutation,
  useRetryStudentOnboardingHandoffMutation,
  usePreviewStudentOnboardingActivationQuery,
  useGetAvailableStudentIdentifierSeriesQuery,
  useRefreshStudentOnboardingReadinessMutation,
  useGetStudentOnboardingPlacementOptionsQuery,
  useAllocateStudentOnboardingIdentifierMutation,
} from 'src/redux/student/admissions/student-onboarding-api';

import {
  getOnboardingStatusColor,
  getOnboardingStatusLabel,
  isOnboardingStepSatisfied,
  ONBOARDING_STEP_STATUS_LABELS,
} from './student-onboarding-status';

type StepEdit = { key: string; label: string; status: StudentOnboardingStepStatus; detail: string };

export default function StudentOnboardingWorkspaceScreen() {
  const { id } = useParams<{ id: string }>();
  const auth = useSelector((state: RootState) => state.auth);
  const { permissions } = auth;
  const currentUserId = auth.user?.sub as string | undefined;
  const canEdit = hasGrantedPermission(permissions, 'Students.Onboarding.Edit');
  const canWaive = hasGrantedPermission(permissions, 'Students.Onboarding.Waive');
  const canAllocateSeat = hasGrantedPermission(permissions, 'Students.Onboarding.AllocateSeat');
  const canAllocateIdentifier = hasGrantedPermission(
    permissions,
    'Students.Onboarding.AllocateIdentifier'
  );
  const canActivate = hasGrantedPermission(permissions, 'Students.Onboarding.Activate');
  const canCancel = hasGrantedPermission(permissions, 'Students.Onboarding.Cancel');
  const canRepair = hasGrantedPermission(permissions, 'Students.Onboarding.Repair');
  const caseQuery = useGetStudentOnboardingCaseQuery(id);
  const onboardingCase = caseQuery.data;
  const previewQuery = usePreviewStudentOnboardingActivationQuery(id, {
    skip: !onboardingCase || onboardingCase.status >= 4,
  });
  const handoffQuery = useGetStudentOnboardingHandoffsQuery(id, {
    skip: onboardingCase?.status !== 4,
  });
  const placementOptionsQuery = useGetStudentOnboardingPlacementOptionsQuery(id, {
    skip: !onboardingCase || !canAllocateSeat,
  });
  const seriesQuery = useGetAvailableStudentIdentifierSeriesQuery(id, {
    skip: !onboardingCase || !canAllocateIdentifier,
  });
  const [updateStep, updateStepState] = useUpdateStudentOnboardingStepMutation();
  const [assignOwner, assignOwnerState] = useAssignStudentOnboardingOwnerMutation();
  const [refreshReadiness, refreshReadinessState] = useRefreshStudentOnboardingReadinessMutation();
  const [setPlacement, placementState] = useSetStudentOnboardingPlacementMutation();
  const [allocateIdentifier, identifierState] = useAllocateStudentOnboardingIdentifierMutation();
  const [activate, activateState] = useActivateStudentOnboardingMutation();
  const [cancel, cancelState] = useCancelStudentOnboardingMutation();
  const [retryHandoff, retryState] = useRetryStudentOnboardingHandoffMutation();
  const [stepEdit, setStepEdit] = useState<StepEdit | null>(null);
  const [divisionId, setDivisionId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [manualIdentifier, setManualIdentifier] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const activationIdempotencyKey = useRef(crypto.randomUUID());

  const divisions = placementOptionsQuery.data ?? [];
  const editable = Boolean(onboardingCase && onboardingCase.status < 4);

  const run = async (work: () => Promise<unknown>, success: string) => {
    try {
      await work();
      shikshaMitraToast.success({ message: success });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message:
          parseApiProblemDetail(error).detail || 'The onboarding action could not be completed',
      });
      return false;
    }
  };

  if (caseQuery.isLoading)
    return (
      <Stack spacing={2}>
        <Skeleton height={80} />
        <Skeleton variant="rounded" height={180} />
        <Skeleton variant="rounded" height={420} />
      </Stack>
    );
  if (caseQuery.isError || !onboardingCase)
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => caseQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Unable to load this onboarding case.
      </Alert>
    );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading={onboardingCase.studentName}
        description={`Onboarding from application ${onboardingCase.applicationNumber} · ${onboardingCase.academicYearName} · ${onboardingCase.intendedStandardName}`}
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Student Onboarding', href: '/student/onboarding' },
          { name: onboardingCase.studentName },
        ]}
      />

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={getOnboardingStatusLabel(onboardingCase.status)}
                  color={getOnboardingStatusColor(onboardingCase.status)}
                />
                {onboardingCase.isOverdue && (
                  <Chip label="SLA overdue" color="error" size="small" />
                )}
                {onboardingCase.isHistoricalBackfill && (
                  <Chip label="Historical import" color="info" size="small" />
                )}
              </Stack>
              <LinearProgress variant="determinate" value={onboardingCase.progressPercent} />
              <Typography variant="caption">{onboardingCase.progressPercent}% complete</Typography>
              <Typography variant="caption" color="text.secondary">
                Due {new Date(onboardingCase.dueAt).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Owner: {onboardingCase.assignedToUserName || 'Unassigned'}
              </Typography>
              {canEdit && editable && (
                <LoadingButton
                  size="small"
                  variant="text"
                  loading={refreshReadinessState.isLoading}
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={() =>
                    run(
                      () =>
                        refreshReadiness({
                          id,
                          concurrencyStamp: onboardingCase.concurrencyStamp,
                        }).unwrap(),
                      'Readiness refreshed from Student records'
                    )
                  }
                >
                  Refresh profile readiness
                </LoadingButton>
              )}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Button
                href={`/student/admissions/applicants/${onboardingCase.applicantId}`}
                variant="outlined"
                startIcon={<Iconify icon="mdi:account-details-outline" />}
              >
                Applicant 360
              </Button>
              {canCancel && editable && (
                <Button color="error" variant="outlined" onClick={() => setCancelOpen(true)}>
                  Cancel onboarding
                </Button>
              )}
              {canEdit && editable && currentUserId && (
                <LoadingButton
                  variant="outlined"
                  loading={assignOwnerState.isLoading}
                  onClick={() =>
                    run(
                      () =>
                        assignOwner({
                          id,
                          concurrencyStamp: onboardingCase.concurrencyStamp,
                          userId:
                            onboardingCase.assignedToUserId === currentUserId
                              ? null
                              : currentUserId,
                        }).unwrap(),
                      onboardingCase.assignedToUserId === currentUserId
                        ? 'Onboarding owner cleared'
                        : 'Onboarding assigned to you'
                    )
                  }
                >
                  {onboardingCase.assignedToUserId === currentUserId
                    ? 'Clear my assignment'
                    : 'Assign to me'}
                </LoadingButton>
              )}
            </Stack>
          </Stack>
          {onboardingCase.lastError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {onboardingCase.lastError}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <Stack spacing={2} sx={{ flex: 1, width: 1 }}>
          {onboardingCase.steps.map((step) => {
            const satisfied = isOnboardingStepSatisfied(step.status);
            const systemManaged =
              step.key === 'identity' ||
              step.key === 'family' ||
              step.key === 'communication' ||
              step.key === 'documents' ||
              step.key === 'medical_previous_school' ||
              step.key === 'placement_seat' ||
              step.key === 'identifiers_roll' ||
              step.key === 'final_readiness';
            return (
              <Card key={step.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" gap={2}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1">
                        {step.displayOrder}. {step.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.detail ||
                          (step.required
                            ? 'Required before activation.'
                            : 'Optional for this policy.')}
                      </Typography>
                      {step.waiverReason && (
                        <Typography variant="caption">Waiver: {step.waiverReason}</Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        color={satisfied ? 'success' : step.status === 3 ? 'error' : 'default'}
                        label={ONBOARDING_STEP_STATUS_LABELS[step.status]}
                      />
                      {canEdit && editable && !systemManaged && (
                        <Button
                          size="small"
                          onClick={() =>
                            setStepEdit({
                              key: step.key,
                              label: step.label,
                              status: step.status,
                              detail: step.detail ?? '',
                            })
                          }
                        >
                          Update
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        <Stack spacing={2} sx={{ width: { xs: 1, lg: 380 }, flexShrink: 0 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Placement and seat</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Intended class: {onboardingCase.intendedStandardName}. Confirm a division; its
                reservation counts against capacity.
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                label="Division"
                value={divisionId || onboardingCase.divisionId || ''}
                onChange={(event) => setDivisionId(event.target.value)}
                disabled={!canAllocateSeat || !editable}
              >
                <MenuItem value="">Select division</MenuItem>
                {divisions.map((division) => (
                  <MenuItem
                    key={division.id}
                    value={division.id}
                    disabled={division.isFull && division.id !== onboardingCase.divisionId}
                  >
                    {division.name} · {division.availableSeats} available (
                    {division.activeEnrollments} enrolled, {division.liveReservations} reserved)
                  </MenuItem>
                ))}
              </TextField>
              <LoadingButton
                fullWidth
                sx={{ mt: 1 }}
                variant="contained"
                loading={placementState.isLoading}
                disabled={
                  !canAllocateSeat || !editable || !(divisionId || onboardingCase.divisionId)
                }
                onClick={() =>
                  run(
                    () =>
                      setPlacement({
                        id,
                        concurrencyStamp: onboardingCase.concurrencyStamp,
                        divisionId: divisionId || onboardingCase.divisionId!,
                      }).unwrap(),
                    'Seat reserved'
                  )
                }
              >
                Reserve seat
              </LoadingButton>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6">Identifiers and roll</Typography>
              {onboardingCase.grNumber && (
                <Alert severity="info" sx={{ my: 1 }}>
                  Existing permanent GR: {onboardingCase.grNumber}
                </Alert>
              )}
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="GR / admission number series"
                  value={seriesId}
                  onChange={(event) => setSeriesId(event.target.value)}
                  disabled={!canAllocateIdentifier || !editable || Boolean(onboardingCase.grNumber)}
                >
                  <MenuItem value="">
                    {onboardingCase.grNumber ? 'Reuse existing GR' : 'Select series'}
                  </MenuItem>
                  {(seriesQuery.data ?? [])
                    .filter(
                      (series) =>
                        !series.standardId ||
                        series.standardId === onboardingCase.intendedStandardId
                    )
                    .map((series) => (
                      <MenuItem key={series.id} value={series.id}>
                        {series.name} · next {series.nextPreview}
                      </MenuItem>
                    ))}
                </TextField>
                {!onboardingCase.grNumber && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={manualIdentifier}
                        onChange={(event) => setManualIdentifier(event.target.checked)}
                        disabled={!canAllocateIdentifier || !editable}
                      />
                    }
                    label="Manually override the generated GR / admission number"
                  />
                )}
                {manualIdentifier && !onboardingCase.grNumber && (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      label="Manual GR / admission number"
                      value={manualValue}
                      onChange={(event) => setManualValue(event.target.value)}
                      inputProps={{ maxLength: 100 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                      label="Override reason"
                      value={overrideReason}
                      onChange={(event) => setOverrideReason(event.target.value)}
                      inputProps={{ maxLength: 1000 }}
                    />
                  </>
                )}
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Roll number"
                  value={rollNumber || onboardingCase.rollNumber || ''}
                  onChange={(event) => setRollNumber(event.target.value)}
                  disabled={!canAllocateIdentifier || !editable}
                  inputProps={{ min: 1 }}
                />
                <LoadingButton
                  variant="contained"
                  loading={identifierState.isLoading}
                  disabled={
                    !canAllocateIdentifier ||
                    !editable ||
                    !Number(rollNumber || onboardingCase.rollNumber) ||
                    (!onboardingCase.grNumber && !seriesId) ||
                    (manualIdentifier && (!manualValue.trim() || !overrideReason.trim()))
                  }
                  onClick={() =>
                    run(
                      () =>
                        allocateIdentifier({
                          id,
                          concurrencyStamp: onboardingCase.concurrencyStamp,
                          numberSeriesId: seriesId || '00000000-0000-0000-0000-000000000000',
                          rollNumber: Number(rollNumber || onboardingCase.rollNumber),
                          manualValue: manualIdentifier ? manualValue.trim() : undefined,
                          overrideReason: manualIdentifier ? overrideReason.trim() : undefined,
                        }).unwrap(),
                      'Identifiers prepared'
                    )
                  }
                >
                  Prepare identifiers
                </LoadingButton>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6">Final readiness</Typography>
              {previewQuery.isLoading && <Skeleton height={60} />}
              {previewQuery.data?.lastError ? (
                <Alert severity="warning" sx={{ my: 1 }}>
                  {previewQuery.data.lastError}
                </Alert>
              ) : (
                <Alert severity="success" sx={{ my: 1 }}>
                  All required gates are ready.
                </Alert>
              )}
              <LoadingButton
                fullWidth
                color="success"
                variant="contained"
                loading={activateState.isLoading}
                disabled={!canActivate || !editable || previewQuery.data?.status !== 2}
                onClick={() =>
                  run(
                    () =>
                      activate({
                        id,
                        concurrencyStamp: onboardingCase.concurrencyStamp,
                        idempotencyKey: activationIdempotencyKey.current,
                      }).unwrap(),
                    'Student activated and enrolled'
                  )
                }
              >
                Activate Student
              </LoadingButton>
            </CardContent>
          </Card>

          {onboardingCase.status === 4 && (
            <Card>
              <CardContent>
                <Typography variant="h6">Service handoffs</Typography>
                <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
                  {(handoffQuery.data ?? []).map((handoff) => (
                    <Stack
                      key={handoff.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ py: 1 }}
                    >
                      <Box>
                        <Typography variant="body2">{handoff.serviceKey}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {handoff.required ? 'Required' : 'Optional'} · status {handoff.status}
                        </Typography>
                      </Box>
                      {handoff.status === 3 && canRepair && (
                        <LoadingButton
                          size="small"
                          loading={retryState.isLoading}
                          onClick={() =>
                            run(
                              () => retryHandoff({ id, handoffId: handoff.id }).unwrap(),
                              'Handoff retry queued'
                            )
                          }
                        >
                          Retry
                        </LoadingButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="h6">Audit history</Typography>
          <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
            {onboardingCase.events.map((event) => (
              <Box key={event.id} sx={{ py: 1 }}>
                <Typography variant="subtitle2">{event.eventType}</Typography>
                <Typography variant="body2">{event.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.occurredAt).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <CustomDialog
        open={Boolean(stepEdit)}
        handleClose={() => setStepEdit(null)}
        title={stepEdit?.label ?? 'Update step'}
        maxWidth="sm"
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Status"
              value={stepEdit?.status ?? 0}
              onChange={(event) =>
                setStepEdit((current) =>
                  current
                    ? {
                        ...current,
                        status: Number(event.target.value) as StudentOnboardingStepStatus,
                      }
                    : null
                )
              }
            >
              <MenuItem value={0}>Pending</MenuItem>
              <MenuItem value={1}>In progress</MenuItem>
              <MenuItem value={2}>Completed</MenuItem>
              <MenuItem value={3}>Blocked</MenuItem>
              {canWaive && <MenuItem value={4}>Waived</MenuItem>}
            </TextField>
            <TextField
              multiline
              minRows={3}
              label={stepEdit?.status === 4 ? 'Waiver reason' : 'Detail'}
              value={stepEdit?.detail ?? ''}
              onChange={(event) =>
                setStepEdit((current) =>
                  current ? { ...current, detail: event.target.value } : null
                )
              }
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button onClick={() => setStepEdit(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={updateStepState.isLoading}
            disabled={
              !stepEdit ||
              ((stepEdit.status === 3 || stepEdit.status === 4) && !stepEdit.detail.trim())
            }
            onClick={async () => {
              if (!stepEdit) return;
              const ok = await run(
                () =>
                  updateStep({
                    id,
                    stepKey: stepEdit.key,
                    concurrencyStamp: onboardingCase.concurrencyStamp,
                    status: stepEdit.status,
                    detail: stepEdit.detail,
                    waiverReason: stepEdit.status === 4 ? stepEdit.detail : undefined,
                  }).unwrap(),
                'Onboarding step updated'
              );
              if (ok) setStepEdit(null);
            }}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        open={cancelOpen}
        handleClose={() => setCancelOpen(false)}
        title="Cancel onboarding"
        maxWidth="sm"
      >
        <DialogScrollContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Reservations are released, but the Student identity is retained for future reuse.
          </Alert>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Cancellation reason"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
        </DialogScrollContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Keep onboarding</Button>
          <LoadingButton
            color="error"
            variant="contained"
            loading={cancelState.isLoading}
            disabled={!cancelReason.trim()}
            onClick={async () => {
              const ok = await run(
                () =>
                  cancel({
                    id,
                    concurrencyStamp: onboardingCase.concurrencyStamp,
                    reason: cancelReason,
                  }).unwrap(),
                'Onboarding cancelled'
              );
              if (ok) setCancelOpen(false);
            }}
          >
            Cancel onboarding
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
