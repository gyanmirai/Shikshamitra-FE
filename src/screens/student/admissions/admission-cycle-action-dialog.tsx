'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { parseDateOnly } from 'src/utils/date-only';
import { Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
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
  validationError?: string | null;
  onRetryValidation?: () => void;
  busy: boolean;
  onClose: () => void;
  onConfirm: (payload: AdmissionCycleAction | ReopenAdmissionCycle) => Promise<void>;
};

const titles: Record<CycleGuardedAction, string> = {
  publish: 'Publish Admission Cycle?',
  close: 'Close Admission Cycle?',
  reopen: 'Reopen Admission Cycle?',
  archive: 'Archive Admission Cycle?',
  delete: 'Delete Draft Permanently?',
};

const actionLabels: Record<CycleGuardedAction, string> = {
  publish: 'Publish',
  close: 'Close Cycle',
  reopen: 'Reopen Cycle',
  archive: 'Archive',
  delete: 'Delete',
};

const actionIcons: Record<CycleGuardedAction, string> = {
  publish: GlobalIcons.publish,
  close: GlobalIcons.lockIcon,
  reopen: 'mdi:lock-open-outline',
  archive: GlobalIcons.archive,
  delete: GlobalIcons.delete,
};

export function AdmissionCycleActionDialog({
  action,
  cycle,
  validation,
  validationError,
  onRetryValidation,
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
  const needsReason = action === 'reopen';
  const hasBlockingValidation = action === 'publish' && Boolean(validation?.errors.length);
  const publishPending = action === 'publish' && !validation && !validationError;
  const retryPublish = action === 'publish' && validationError ? onRetryValidation : undefined;
  const checking = publishPending || impactPending;
  const startDate = parseDateOnly(cycle.startDate);
  const endDate = parseDateOnly(cycle.endDate);
  const windowDays = startDate && endDate ? endDate.diff(startDate, 'day') + 1 : 0;
  const cannotArchive = action === 'archive' && Boolean(impact?.activeOfferingCount);
  const cannotDelete =
    action === 'delete' &&
    Boolean((impact?.linkedOfferingCount ?? 0) > 0 || (impact?.applicationCount ?? 0) > 0);
  const disabled =
    busy ||
    checking ||
    (action === 'publish' && (!validation?.isValid || Boolean(validationError))) ||
    impactError ||
    hasBlockingValidation ||
    cannotArchive ||
    cannotDelete ||
    (needsReason && !reason.trim()) ||
    (action === 'reopen' && (!newEndDate || dayjs(newEndDate).isBefore(dayjs(), 'day')));

  const confirm = async () => {
    if (disabled) return;
    await onConfirm({
      concurrencyStamp: cycle.concurrencyStamp,
      // Close cycle is the staff confirmation; keep the required audit and API acknowledgement.
      reason:
        action === 'close'
          ? 'Admission cycle closed by staff confirmation.'
          : action === 'archive'
            ? 'Admission cycle archived by staff confirmation.'
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
      lockOnActionLoading={!checking}
      icon={action === 'delete' ? 'error' : action === 'reopen' ? 'success' : 'warning'}
      title={titles[action]}
      content={
        <Stack spacing={1.5}>
          {action === 'delete' ? (
            <Typography variant="body2">
              The Draft Admission Cycle <strong>&ldquo;{cycle.name}&rdquo;</strong> will be
              permanently deleted.
            </Typography>
          ) : action === 'close' ? (
            <Typography variant="body2">
              Closing <strong>&ldquo;{cycle.name}&rdquo;</strong> stops new applications. Existing
              applications remain available for review.
            </Typography>
          ) : action === 'archive' ? (
            <Typography variant="body2">
              Archive the admission cycle <strong>&ldquo;{cycle.name}&rdquo;</strong>?
            </Typography>
          ) : action !== 'publish' ? (
            <Typography variant="body2">
              <strong>{cycle.name}</strong>
            </Typography>
          ) : null}

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
                are accepted from {startDate?.format(ADMISSION_DATE_FORMAT) ?? '—'} to{' '}
                {endDate?.format(ADMISSION_DATE_FORMAT) ?? '—'}
                {windowDays > 0 && ` (${windowDays} ${windowDays === 1 ? 'day' : 'days'})`}.
              </Typography>
              {validationError && (
                <StudentFeedback
                  notificationKey="admission-cycle:publish:check-failed"
                  scopeKey={cycle.id}
                  severity="error"
                >
                  {validationError}
                </StudentFeedback>
              )}
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
              label="New Applications Close Date"
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
              label={`${actionLabels[action]} Reason`}
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
          color={action === 'delete' ? 'error' : 'inherit'}
          loading={busy || checking}
          loadingPosition="start"
          disabled={retryPublish ? busy : disabled}
          startIcon={
            <Iconify icon={retryPublish ? GlobalIcons.refresh : actionIcons[action]} width={18} />
          }
          onClick={retryPublish ?? confirm}
        >
          {retryPublish ? 'Retry check' : actionLabels[action]}
        </LoadingButton>
      }
    />
  );
}
