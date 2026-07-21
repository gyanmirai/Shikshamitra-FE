'use client';

import type {
  AdmissionCrmSeatPoolDto,
  AdmissionCrmSeatPoolUpsertDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Add, Edit, Save, RestartAlt } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmSeatPoolStatus,
  useGetAdmissionCrmSeatPoolsQuery,
  useCreateAdmissionCrmSeatPoolMutation,
  useUpdateAdmissionCrmSeatPoolMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

const emptyForm = (): AdmissionCrmSeatPoolUpsertDto => ({
  code: '',
  name: '',
  roundCode: '',
  campus: '',
  desiredClass: '',
  board: '',
  medium: '',
  applicantCategory: '',
  operationalTarget: 0,
  approvedCapacity: 0,
  isActive: true,
});

const readError = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { errorCode?: string; detail?: string } };
    return data?.errorCode || data?.detail || 'Unable to save the seat pool.';
  }
  return 'Unable to save the seat pool.';
};

const toForm = (pool: AdmissionCrmSeatPoolDto): AdmissionCrmSeatPoolUpsertDto => ({
  concurrencyStamp: pool.concurrencyStamp,
  playbookId: pool.playbookId,
  code: pool.code,
  name: pool.name,
  roundCode: pool.roundCode,
  campus: pool.campus,
  desiredClass: pool.desiredClass,
  board: pool.board,
  medium: pool.medium,
  applicantCategory: pool.applicantCategory,
  operationalTarget: pool.operationalTarget,
  approvedCapacity: pool.approvedCapacity,
  isActive: pool.status === AdmissionCrmSeatPoolStatus.Active,
});

export default function AdmissionsSeatPoolConfiguration() {
  const { academicYearId } = useEnrollmentWorkspace();
  const [editing, setEditing] = useState<AdmissionCrmSeatPoolDto | null>(null);
  const [form, setForm] = useState<AdmissionCrmSeatPoolUpsertDto>(() => emptyForm());
  const poolsQuery = useGetAdmissionCrmSeatPoolsQuery(
    { academicYearId: academicYearId || '', maxResultCount: 200 },
    { skip: !academicYearId }
  );
  const [createPool, createState] = useCreateAdmissionCrmSeatPoolMutation();
  const [updatePool, updateState] = useUpdateAdmissionCrmSeatPoolMutation();

  const formBaseline = useMemo(() => (editing ? toForm(editing) : emptyForm()), [editing]);
  const formDirty = JSON.stringify(form) !== JSON.stringify(formBaseline);

  useEnrollmentSettingsDirtyState({
    source: 'admissions-seat-pool-editor',
    dirty: formDirty,
    onDiscard: () => {
      setEditing(null);
      setForm(emptyForm());
    },
  });

  const reset = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const save = async () => {
    if (!academicYearId || !form.code.trim() || !form.name.trim()) return;
    if (form.operationalTarget < 0 || form.approvedCapacity < form.operationalTarget) {
      shikshaMitraToast.error({
        message: 'Approved capacity must be at least the non-negative operational target.',
      });
      return;
    }
    const body = {
      ...form,
      code: form.code.trim(),
      name: form.name.trim(),
      roundCode: form.roundCode?.trim() || null,
      campus: form.campus?.trim() || null,
      desiredClass: form.desiredClass?.trim() || null,
      board: form.board?.trim() || null,
      medium: form.medium?.trim() || null,
      applicantCategory: form.applicantCategory?.trim() || null,
    };
    try {
      if (editing) {
        await updatePool({ seatPoolId: editing.id, body }).unwrap();
      } else {
        await createPool({ academicYearId, body }).unwrap();
      }
      shikshaMitraToast.success({ message: editing ? 'Seat pool updated.' : 'Seat pool created.' });
      reset();
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
    }
  };

  return (
    <Stack spacing={1.5} sx={{ py: 1 }}>
      {!academicYearId ? <Alert severity="warning">Select an academic year.</Alert> : null}
      {poolsQuery.isFetching ? <LinearProgress /> : null}
      {poolsQuery.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => poolsQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Seat pools could not be loaded.
        </Alert>
      ) : null}
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
            <Box>
              <Typography variant="subtitle1">
                {editing ? `Edit ${editing.code}` : 'New Seat Pool'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Live capacity is tracked separately from reusable playbook targets.
              </Typography>
            </Box>
            <Tooltip title="Reset form">
              <IconButton size="small" aria-label="Reset seat pool form" onClick={reset}>
                <RestartAlt fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            <TextField
              size="small"
              label="Code"
              value={form.code}
              disabled={Boolean(editing)}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            />
            <TextField
              size="small"
              label="Name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <TextField
              size="small"
              label="Admission round"
              value={form.roundCode || ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, roundCode: event.target.value }))
              }
            />
            <TextField
              size="small"
              label="Campus"
              value={form.campus || ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, campus: event.target.value }))
              }
            />
            <TextField
              size="small"
              label="Class"
              value={form.desiredClass || ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, desiredClass: event.target.value }))
              }
            />
            <TextField
              size="small"
              label="Board"
              value={form.board || ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, board: event.target.value }))
              }
            />
            <TextField
              size="small"
              label="Medium"
              value={form.medium || ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, medium: event.target.value }))
              }
            />
            <TextField
              size="small"
              label="Applicant category"
              value={form.applicantCategory || ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, applicantCategory: event.target.value }))
              }
            />
            <TextField
              select
              size="small"
              label="Status"
              value={form.isActive ? 'active' : 'closed'}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.value === 'active' }))
              }
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField
              size="small"
              type="number"
              label="Operational target"
              value={form.operationalTarget}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  operationalTarget: Number(event.target.value),
                }))
              }
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <TextField
              size="small"
              type="number"
              label="Approved capacity"
              value={form.approvedCapacity}
              onChange={(event) =>
                setForm((current) => ({ ...current, approvedCapacity: Number(event.target.value) }))
              }
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Box>
          <LoadingButton
            variant="contained"
            startIcon={editing ? <Save /> : <Add />}
            loading={createState.isLoading || updateState.isLoading}
            disabled={!academicYearId || !form.code.trim() || !form.name.trim()}
            onClick={save}
            sx={{ alignSelf: 'flex-start' }}
          >
            {editing ? 'Save Seat Pool' : 'Create Seat Pool'}
          </LoadingButton>
        </Stack>
      </Paper>

      <Stack spacing={1}>
        {(poolsQuery.data?.items || []).map((pool) => (
          <Paper key={pool.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {pool.code} - {pool.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {[pool.campus, pool.desiredClass, pool.board, pool.medium, pool.applicantCategory]
                    .filter(Boolean)
                    .join(' / ') || 'General pool'}
                </Typography>
              </Box>
              <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                <Chip
                  size="small"
                  label={`${pool.occupiedSeats}/${pool.approvedCapacity} occupied`}
                  color={pool.isOverCapacity ? 'error' : 'default'}
                />
                <Chip size="small" label={`${pool.remainingCapacity} remaining`} />
                <Chip size="small" label={`${pool.waitlistedApplicants} waitlisted`} />
                <Tooltip title="Edit seat pool">
                  <IconButton
                    size="small"
                    aria-label={`Edit seat pool ${pool.name}`}
                    onClick={() => {
                      setEditing(pool);
                      setForm(toForm(pool));
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        ))}
        {!poolsQuery.isFetching && !(poolsQuery.data?.items || []).length ? (
          <Alert severity="info">No seat pools are configured for this academic year.</Alert>
        ) : null}
      </Stack>
    </Stack>
  );
}
