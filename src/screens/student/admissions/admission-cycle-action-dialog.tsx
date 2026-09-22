'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  Box,
  Alert,
  Stack,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  type AdmissionCycle,
  type AdmissionCycleAction,
  type ReopenAdmissionCycle,
  type AdmissionCycleValidation,
  useLazyGetAdmissionCycleImpactQuery,
} from 'src/redux/student/admissions/admission-cycles-api';

import { ADMISSION_DATE_FORMAT } from './admission-date-formats';

export type CycleGuardedAction = 'publish' | 'close' | 'reopen' | 'archive' | 'delete';

type Props = {
  action: CycleGuardedAction | null;
  cycle: AdmissionCycle | null;
  validation?: AdmissionCycleValidation | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (payload: AdmissionCycleAction | ReopenAdmissionCycle) => Promise<void>;
};

const titles: Record<CycleGuardedAction, string> = {
  publish: 'Publish admission cycle?',
  close: 'Close admission cycle?',
  reopen: 'Reopen admission cycle?',
  archive: 'Archive admission cycle?',
  delete: 'Delete draft permanently?',
};

const actionLabels: Record<CycleGuardedAction, string> = {
  publish: 'Publish',
  close: 'Close cycle',
  reopen: 'Reopen cycle',
  archive: 'Archive',
  delete: 'Delete draft',
};

export function AdmissionCycleActionDialog({
  action,
  cycle,
  validation,
  busy,
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [confirmOfferings, setConfirmOfferings] = useState(false);
  const [loadImpact, { data: impact, isFetching: impactLoading }] =
    useLazyGetAdmissionCycleImpactQuery();

  useEffect(() => {
    setReason('');
    setNewEndDate(cycle?.endDate?.slice(0, 10) ?? '');
    setConfirmOfferings(false);
    if (cycle && action && action !== 'publish') loadImpact(cycle.id);
  }, [action, cycle, loadImpact]);

  if (!action || !cycle) return null;

  const needsReason = action === 'close' || action === 'reopen' || action === 'archive';
  const hasBlockingValidation = action === 'publish' && Boolean(validation?.errors.length);
  const needsOfferingConfirmation = action === 'close' && Boolean(impact?.activeOfferingCount);
  const cannotArchive = action === 'archive' && Boolean(impact?.activeOfferingCount);
  const cannotDelete =
    action === 'delete' &&
    Boolean((impact?.linkedOfferingCount ?? 0) > 0 || (impact?.applicationCount ?? 0) > 0);
  const disabled =
    busy ||
    impactLoading ||
    hasBlockingValidation ||
    cannotArchive ||
    cannotDelete ||
    (needsReason && !reason.trim()) ||
    (needsOfferingConfirmation && !confirmOfferings) ||
    (action === 'reopen' && (!newEndDate || dayjs(newEndDate).isBefore(dayjs(), 'day')));

  const confirm = async () => {
    await onConfirm({
      concurrencyStamp: cycle.concurrencyStamp,
      reason: reason.trim() || undefined,
      confirmActiveOfferings: confirmOfferings,
      ...(action === 'reopen' ? { newEndDate } : {}),
    });
  };

  return (
    <ConfirmDialog
      open
      onClose={busy ? () => undefined : onClose}
      icon={action === 'publish' || action === 'reopen' ? 'info' : 'warning'}
      title={titles[action]}
      content={
        <Stack spacing={1.5}>
          <Typography variant="body2">
            <strong>{cycle.name}</strong> ({cycle.code})
          </Typography>

          {action === 'publish' && (
            <>
              <Typography variant="body2">
                Publishing makes this cycle available to linked admission offerings. Applications
                are accepted only during {dayjs(cycle.startDate).format('DD MMM YYYY')}–
                {dayjs(cycle.endDate).format('DD MMM YYYY')}.
              </Typography>
              {validation?.errors.map((issue) => (
                <Alert severity="error" key={issue.code}>
                  {issue.message}
                </Alert>
              ))}
              {validation?.warnings.map((issue) => (
                <Alert severity="warning" key={issue.code}>
                  {issue.message}
                </Alert>
              ))}
              {!validation && <Alert severity="info">Checking publication readiness…</Alert>}
              {validation?.isValid && !validation.warnings.length && (
                <Alert severity="success">This cycle is ready to publish.</Alert>
              )}
            </>
          )}

          {action !== 'publish' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Offerings
                </Typography>
                <Typography fontWeight={600}>{impact?.linkedOfferingCount ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
                <Typography fontWeight={600}>{impact?.activeOfferingCount ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Applications
                </Typography>
                <Typography fontWeight={600}>{impact?.applicationCount ?? '—'}</Typography>
              </Box>
            </Box>
          )}

          {action === 'close' && (
            <Alert severity="warning">
              New applications stop immediately. Existing applications remain available for review.
            </Alert>
          )}
          {needsOfferingConfirmation && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmOfferings}
                  onChange={(event) => setConfirmOfferings(event.target.checked)}
                />
              }
              label={`I understand ${impact?.activeOfferingCount} active offering(s) will stop accepting applications.`}
            />
          )}
          {cannotArchive && (
            <Alert severity="error">
              Close or deactivate active offerings before archiving this cycle.
            </Alert>
          )}
          {cannotDelete && (
            <Alert severity="error">
              Only an unused draft with no offerings or applications can be deleted.
            </Alert>
          )}
          {action === 'delete' && !cannotDelete && (
            <Alert severity="error">
              This cannot be undone. Use Archive for historical cycles.
            </Alert>
          )}

          {action === 'reopen' && (
            <DatePicker
              label="New applications close date"
              format={ADMISSION_DATE_FORMAT}
              minDate={dayjs()}
              value={newEndDate ? dayjs(newEndDate) : null}
              onChange={(value) =>
                setNewEndDate(value?.isValid() ? value.format('YYYY-MM-DD') : '')
              }
              slotProps={{ textField: { fullWidth: true, size: 'small', required: true } }}
            />
          )}

          {needsReason && (
            <TextField
              fullWidth
              required
              multiline
              minRows={2}
              size="small"
              label={`${actionLabels[action]} reason`}
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 500))}
              helperText={`${reason.length}/500 characters`}
            />
          )}
        </Stack>
      }
      action={
        <LoadingButton
          variant="contained"
          size="small"
          color={
            action === 'delete' || action === 'archive' || action === 'close' ? 'error' : 'primary'
          }
          loading={busy}
          disabled={disabled}
          startIcon={
            <Iconify icon={action === 'delete' ? GlobalIcons.delete : GlobalIcons.submit} />
          }
          onClick={confirm}
        >
          {actionLabels[action]}
        </LoadingButton>
      }
    />
  );
}
