'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Stack, TextField, Typography, CircularProgress } from '@mui/material';
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
  delete: 'Delete',
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
  const [loadImpact, impactQuery] = useLazyGetAdmissionCycleImpactQuery();

  useEffect(() => {
    setReason('');
    setNewEndDate(cycle?.endDate?.slice(0, 10) ?? '');
    if (cycle && action && action !== 'publish') loadImpact(cycle.id);
  }, [action, cycle, loadImpact]);

  if (!action || !cycle) return null;

  const needsImpact = action !== 'publish';
  const impactError =
    needsImpact &&
    impactQuery.originalArgs === cycle.id &&
    (impactQuery.isError ||
      Boolean(
        impactQuery.data &&
        !impactQuery.isFetching &&
        impactQuery.data.admissionCycleId !== cycle.id
      ));
  const impactReady =
    needsImpact &&
    impactQuery.originalArgs === cycle.id &&
    impactQuery.data?.admissionCycleId === cycle.id &&
    !impactQuery.isFetching &&
    !impactError;
  const impactPending = needsImpact && !impactReady && !impactError;
  const impact = impactReady ? impactQuery.data : null;
  const needsReason = action === 'reopen' || action === 'archive';
  const hasBlockingValidation = action === 'publish' && Boolean(validation?.errors.length);
  const cannotArchive = action === 'archive' && Boolean(impact?.activeOfferingCount);
  const cannotDelete =
    action === 'delete' &&
    Boolean((impact?.linkedOfferingCount ?? 0) > 0 || (impact?.applicationCount ?? 0) > 0);
  const disabled =
    busy ||
    impactPending ||
    impactError ||
    hasBlockingValidation ||
    cannotArchive ||
    cannotDelete ||
    (needsReason && !reason.trim()) ||
    (action === 'reopen' && (!newEndDate || dayjs(newEndDate).isBefore(dayjs(), 'day')));

  const confirm = async () => {
    await onConfirm({
      concurrencyStamp: cycle.concurrencyStamp,
      // Close cycle is the staff confirmation; keep the required audit and API acknowledgement.
      reason:
        action === 'close'
          ? 'Admission cycle closed by staff confirmation.'
          : reason.trim() || undefined,
      confirmActiveOfferings: action === 'close' && Boolean(impact?.activeOfferingCount),
      ...(action === 'reopen' ? { newEndDate } : {}),
    });
  };

  return (
    <ConfirmDialog
      open
      onClose={busy ? () => undefined : onClose}
      disableBackdropClick
      disableEscapeKeyDown={busy}
      disableCancel={busy}
      icon={
        action === 'delete'
          ? 'error'
          : action === 'publish' || action === 'reopen'
            ? 'info'
            : 'warning'
      }
      title={titles[action]}
      content={
        <Stack spacing={1.5}>
          {action === 'delete' ? (
            <Typography variant="body2">
              The draft admission cycle <strong>&ldquo;{cycle.name}&rdquo;</strong> will be
              permanently deleted.
            </Typography>
          ) : action === 'close' ? (
            <Typography variant="body2">
              Closing <strong>&ldquo;{cycle.name}&rdquo;</strong> stops new applications. Existing
              applications remain available for review.
            </Typography>
          ) : action !== 'publish' ? (
            <Typography variant="body2">
              <strong>{cycle.name}</strong> ({cycle.code})
            </Typography>
          ) : null}

          {impactPending && (
            <Stack direction="row" spacing={1} alignItems="center" role="status" aria-live="polite">
              <CircularProgress size={18} aria-label="Checking admission cycle" />
              <Typography variant="body2" color="text.secondary">
                Checking linked offerings and applications…
              </Typography>
            </Stack>
          )}
          {impactError && (
            <StudentFeedback
              notificationKey="STU-0028"
              scopeKey={cycle.id}
              presentation="toast"
              severity="error"
            >
              Could not check linked records. Close this dialog and try again.
            </StudentFeedback>
          )}

          {action === 'publish' && (
            <>
              <Typography variant="body2">
                Publishing makes this cycle available to linked admission offerings. Applications
                are accepted only during {dayjs(cycle.startDate).format('DD MMM YYYY')}–
                {dayjs(cycle.endDate).format('DD MMM YYYY')}.
              </Typography>
              {validation?.errors.map((issue) => (
                <StudentFeedback
                  key={issue.code}
                  notificationKey={`admission-cycle:publish:error:${issue.code}`}
                  scopeKey={cycle.id}
                  presentation="inline"
                  severity="error"
                  role="alert"
                >
                  {issue.message}
                </StudentFeedback>
              ))}
              {validation?.warnings.map((issue) => (
                <StudentFeedback
                  key={issue.code}
                  notificationKey={`admission-cycle:publish:warning:${issue.code}`}
                  scopeKey={cycle.id}
                  presentation="inline"
                  severity="warning"
                  role="status"
                >
                  {issue.message}
                </StudentFeedback>
              ))}
            </>
          )}

          {(action === 'reopen' || action === 'archive') && (
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

          {cannotArchive && (
            <StudentFeedback notificationKey="STU-0029" presentation="persistent" severity="error">
              Close or deactivate active offerings before archiving this cycle.
            </StudentFeedback>
          )}
          {cannotDelete && (
            <StudentFeedback notificationKey="STU-0030" presentation="persistent" severity="error">
              Only an unused draft with no offerings or applications can be deleted.
            </StudentFeedback>
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
            action === 'publish'
              ? 'inherit'
              : action === 'delete' || action === 'archive' || action === 'close'
                ? 'error'
                : 'primary'
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
