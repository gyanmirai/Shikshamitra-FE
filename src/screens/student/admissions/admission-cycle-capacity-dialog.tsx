'use client';

import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  type AdmissionCycle,
  useGetAdmissionCycleCapacityQuery,
  type AdmissionCycleOfferingCapacity,
  useUpdateAdmissionCycleOfferingCapacityMutation,
} from 'src/redux/student/admissions/admission-cycles-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Table,
  Button,
  Divider,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  DialogActions,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';

type Props = {
  cycle: AdmissionCycle | null;
  canManage: boolean;
  onClose: () => void;
};

const readError = (error: unknown): string =>
  (error as { data?: { detail?: string; error?: { message?: string } } })?.data?.detail ||
  (error as { data?: { error?: { message?: string } } })?.data?.error?.message ||
  'Capacity could not be saved. Refresh and try again.';

export function AdmissionCycleCapacityDialog({ cycle, canManage, onClose }: Props) {
  const [editing, setEditing] = useState<AdmissionCycleOfferingCapacity | null>(null);
  const [capacity, setCapacity] = useState('');
  const [reason, setReason] = useState('');
  const { data, isLoading, isFetching, isError, refetch } = useGetAdmissionCycleCapacityQuery(
    cycle?.id ?? '',
    { skip: !cycle }
  );
  const [updateCapacity, { isLoading: isSaving }] =
    useUpdateAdmissionCycleOfferingCapacityMutation();

  useEffect(() => {
    setEditing(null);
    setCapacity('');
    setReason('');
  }, [cycle?.id]);

  if (!cycle) return null;

  const numericCapacity = Number(capacity);
  const occupied = (editing?.reservedCount ?? 0) + (editing?.confirmedCount ?? 0);
  const capacityError =
    capacity !== '' &&
    (!Number.isInteger(numericCapacity) || numericCapacity < Math.max(1, occupied) || numericCapacity > 100000);
  const canSave =
    editing && !capacityError && capacity !== '' && reason.trim().length > 0 && !isSaving;
  const isReadOnly = !canManage || cycle.status === 2 || cycle.status === 3;

  const startEdit = (row: AdmissionCycleOfferingCapacity) => {
    setEditing(row);
    setCapacity(row.capacity?.toString() ?? '');
    setReason('');
  };

  const save = async () => {
    if (!editing || !canSave) return;
    try {
      const summary = await updateCapacity({
        cycleId: cycle.id,
        offeringId: editing.admissionOfferingId,
        body: {
          capacity: numericCapacity,
          reason: reason.trim(),
          poolConcurrencyStamp: editing.poolConcurrencyStamp,
        },
      }).unwrap();
      const refreshed = summary.offerings.find(
        (row) => row.admissionOfferingId === editing.admissionOfferingId
      );
      setEditing(null);
      setCapacity('');
      setReason('');
      shikshaMitraToast.success({
        message: refreshed
          ? `${refreshed.offeringName} capacity saved`
          : 'Offering capacity saved',
      });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
    }
  };

  const metrics = data
    ? [
        ['Effective capacity', data.totalCapacity],
        ['Reserved', data.reservedCount],
        ['Confirmed', data.confirmedCount],
        ['Remaining', data.remainingCapacity],
        ['Waitlisted', data.waitlistedCount],
      ]
    : [];

  return (
    <CustomDialog
      open
      handleClose={onClose}
      title={
        <AdmissionDialogTitle
          title="Capacity & reservations"
          helpText="Capacity is controlled per offering. Reservation, confirmation and waitlist counts come from the live admission journey and are enforced by its Seat stage."
          helpLabel="About capacity and reservations"
        />
      }
      maxWidth="md"
      hasForm={false}
      disableClose={isSaving}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {cycle.name}
            </Typography>
          </Box>

          {isLoading && (
            <Stack direction="row" spacing={1} alignItems="center" role="status">
              <CircularProgress size={20} />
              <Typography variant="body2">Loading capacity…</Typography>
            </Stack>
          )}
          {isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Capacity and reservation details could not be loaded.
            </Alert>
          )}

          {data && (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                {metrics.map(([label, value]) => (
                  <Box key={String(label)} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h6">{value}</Typography>
                  </Box>
                ))}
              </Box>

              {data.unconfiguredOfferingCount > 0 && (
                <Alert severity="warning">
                  {data.unconfiguredOfferingCount} of {data.offeringCount} offerings have no capacity yet.
                  Configure them before applications reach seat allocation.
                </Alert>
              )}
              {data.notSeatManagedOfferingCount > 0 && (
                <Alert severity="info">
                  {data.notSeatManagedOfferingCount} of {data.offeringCount} offerings do not use a Seat
                  stage. Assign a published Admission Stage workflow with a Seat stage before configuring capacity.
                </Alert>
              )}
              {data.overCapacityOfferingCount > 0 && (
                <Alert severity="error">
                  {data.overCapacityOfferingCount} offerings are over capacity. Review them immediately.
                </Alert>
              )}
              {isReadOnly && data.offeringCount > 0 && (
                <Alert severity="info">
                  {canManage
                    ? 'Closed or archived admission periods are read-only.'
                    : 'You can view capacity, but you do not have permission to change it.'}
                </Alert>
              )}

              {editing && (
                <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="subtitle2">Set capacity for {editing.offeringName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {occupied} seats are currently reserved or confirmed. Capacity cannot be lower than this.
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <TextField
                        autoFocus
                        required
                        size="small"
                        type="number"
                        label="Seat capacity"
                        value={capacity}
                        error={capacityError}
                        helperText={
                          capacityError
                            ? `Enter a whole number from ${Math.max(1, occupied)} to 100,000.`
                            : 'Maximum approved intake for this offering.'
                        }
                        onChange={(event) => setCapacity(event.target.value)}
                        inputProps={{ min: Math.max(1, occupied), max: 100000, step: 1 }}
                        sx={{ width: { sm: 220 } }}
                      />
                      <TextField
                        required
                        fullWidth
                        size="small"
                        label="Reason for change"
                        value={reason}
                        inputProps={{ maxLength: 512 }}
                        onChange={(event) => setReason(event.target.value)}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button color="inherit" disabled={isSaving} onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                      <Button variant="contained" disabled={!canSave} onClick={save}>
                        {isSaving ? 'Saving…' : 'Save capacity'}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}

              <Divider />
              {!data.offerings.length ? (
                <Alert severity="info">
                  No offerings are linked to this admission period yet. Create an offering before setting capacity.
                </Alert>
              ) : (
                <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Table size="small" aria-label={`Capacity for ${cycle.name}`}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Offering</TableCell>
                        <TableCell align="right">Capacity</TableCell>
                        <TableCell align="right">Reserved</TableCell>
                        <TableCell align="right">Confirmed</TableCell>
                        <TableCell align="right">Remaining</TableCell>
                        <TableCell align="right">Waitlist</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.offerings.map((row) => (
                        <TableRow key={row.admissionOfferingId} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{row.offeringName}</Typography>
                                <Typography variant="caption" color="text.secondary">{row.offeringCode}</Typography>
                              </Box>
                              {!row.isActive && <Chip size="small" label="Inactive" variant="outlined" />}
                              {!row.isSeatManaged && <Chip size="small" label="No Seat stage" variant="outlined" />}
                              {row.isOverCapacity && <Chip size="small" color="error" label="Over capacity" />}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{row.isConfigured ? row.capacity : 'Not set'}</TableCell>
                          <TableCell align="right">{row.reservedCount}</TableCell>
                          <TableCell align="right">{row.confirmedCount}</TableCell>
                          <TableCell align="right">{row.isConfigured ? row.remainingCapacity : '—'}</TableCell>
                          <TableCell align="right">{row.waitlistedCount}</TableCell>
                          <TableCell align="right">
                            <Tooltip
                              title={
                                row.isSeatManaged
                                  ? ''
                                  : 'Assign a published Admission Stage workflow with a Seat stage first.'
                              }
                            >
                              <span>
                                <Button
                                  size="small"
                                  disabled={isReadOnly || isSaving || !row.isSeatManaged}
                                  aria-label={`${row.isConfigured ? 'Change' : 'Set'} capacity for ${row.offeringName}`}
                                  onClick={() => startEdit(row)}
                                >
                                  {row.isConfigured ? 'Change' : 'Set'}
                                </Button>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {isFetching && !isLoading && (
                <Typography variant="caption" color="text.secondary" role="status">
                  Refreshing live counts…
                </Typography>
              )}
            </>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" disabled={isSaving} onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
