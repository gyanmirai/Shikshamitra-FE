import type {
  InquiryFollowUp,
  AdmissionInquiryManagement,
} from 'src/redux/student/admissions/admission-inquiry-management-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { useId, useRef, useState, useEffect } from 'react';
import CustomAccordion from 'src/components/custom-accordian';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Box, Alert, Paper, Stack, Button, TextField, Typography } from '@mui/material';
import {
  useCancelAdmissionInquiryFollowUpMutation,
  useScheduleAdmissionInquiryFollowUpMutation,
  useCompleteAdmissionInquiryFollowUpMutation,
} from 'src/redux/student/admissions/admission-inquiry-management-api';

import { useFollowUpScheduler } from './use-follow-up-scheduler';
import { InquiryFollowUpScheduler } from './inquiry-follow-up-scheduler';

export function InquiryFollowUps({
  value,
  readOnly = false,
}: {
  value: AdmissionInquiryManagement;
  readOnly?: boolean;
}) {
  const [schedule, scheduling] = useScheduleAdmissionInquiryFollowUpMutation();
  const [complete, completing] = useCompleteAdmissionInquiryFollowUpMutation();
  const [cancel, cancelling] = useCancelAdmissionInquiryFollowUpMutation();
  const finishInput = (item: InquiryFollowUp, note: string) => ({
    inquiryId: value.inquiryId,
    followUpId: item.id,
    concurrencyStamp: value.concurrencyStamp,
    followUpConcurrencyStamp: item.concurrencyStamp,
    note,
  });
  return (
    <InquiryFollowUpsPanel
      value={value}
      readOnly={readOnly}
      busy={scheduling.isLoading || completing.isLoading || cancelling.isLoading}
      actions={{
        schedule: (body) =>
          schedule({
            inquiryId: value.inquiryId,
            concurrencyStamp: value.concurrencyStamp,
            ...body,
          }).unwrap(),
        complete: (item, note) => complete(finishInput(item, note)).unwrap(),
        cancel: (item, note) => cancel(finishInput(item, note)).unwrap(),
      }}
    />
  );
}

export type InquiryFollowUpActions = {
  schedule: (body: { scheduledAt: string; purpose: string }) => Promise<unknown>;
  complete: (item: InquiryFollowUp, note: string) => Promise<unknown>;
  cancel: (item: InquiryFollowUp, note: string) => Promise<unknown>;
};

/** Shared inquiry follow-up presentation; the owning lifecycle supplies authorized commands. */
export function InquiryFollowUpsPanel({
  value,
  readOnly = false,
  busy = false,
  actions,
  compact = false,
  disabled = false,
}: {
  value: AdmissionInquiryManagement;
  readOnly?: boolean;
  busy?: boolean;
  actions: InquiryFollowUpActions;
  compact?: boolean;
  disabled?: boolean;
}) {
  const history = useBoolean();
  const scheduler = usePopover();
  const schedulerId = useId();
  const interactionBlocked = busy || disabled;
  const {
    purpose,
    setPurpose,
    scheduledAt,
    setScheduledAt,
    dateError,
    setDateError,
    scheduleError,
    scheduling,
    schedule,
  } = useFollowUpScheduler({
    actions,
    blocked: readOnly || interactionBlocked,
    onScheduled: scheduler.onClose,
  });
  const closeScheduler = () => {
    if (!interactionBlocked && !scheduling) scheduler.onClose();
  };
  const renderScheduler = (inPopover = false) => (
    <InquiryFollowUpScheduler
      scheduledAt={scheduledAt}
      purpose={purpose}
      disabled={interactionBlocked}
      scheduling={scheduling}
      dateError={dateError}
      error={scheduleError}
      titleId={`${schedulerId}-title`}
      onDateChange={setScheduledAt}
      onDateError={setDateError}
      onPurposeChange={setPurpose}
      onSchedule={schedule}
      onClose={inPopover ? closeScheduler : undefined}
    />
  );
  return (
    <Stack spacing={1.5}>
      {compact && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          useFlexGap
          flexWrap="wrap"
        >
          <Typography variant="subtitle2">
            Follow-ups · {value.followUps.filter((item) => item.status === 0).length} open
          </Typography>
          {!readOnly && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:calendar-clock-outline" width={18} />}
              disabled={interactionBlocked || scheduling}
              aria-haspopup="dialog"
              aria-expanded={scheduler.open}
              aria-controls={scheduler.open ? schedulerId : undefined}
              onClick={scheduler.onOpen}
            >
              Schedule follow-up
            </Button>
          )}
        </Stack>
      )}
      {!compact && (
        <Typography variant="subtitle2">
          Follow-ups · {value.followUps.filter((item) => item.status === 0).length} open
        </Typography>
      )}
      {!readOnly && !compact && renderScheduler()}
      {!readOnly && compact && (
        <CustomPopover
          open={scheduler.open}
          anchorEl={scheduler.anchorEl}
          onClose={closeScheduler}
          keepMounted
          slotProps={{
            arrow: { hide: true, placement: 'top-right' },
            paper: {
              id: schedulerId,
              role: 'dialog',
              'aria-labelledby': `${schedulerId}-title`,
              sx: { width: 400, maxWidth: 'calc(100vw - 32px)' },
            },
          }}
        >
          {renderScheduler(true)}
        </CustomPopover>
      )}
      {compact ? (
        <CustomAccordion
          title="Follow-up history"
          expanded={history.value}
          onChange={() => {
            if (!interactionBlocked) history.onToggle();
          }}
          content={
            <Stack spacing={1} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
              {value.followUps.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No follow-ups recorded yet.
                </Typography>
              )}
              {value.followUps.map((item) => (
                <FollowUpCard
                  key={item.id}
                  compact
                  item={item}
                  readOnly={readOnly}
                  busy={interactionBlocked}
                  actions={actions}
                />
              ))}
            </Stack>
          }
        />
      ) : (
        <>
          {value.followUps.length === 0 && (
            <Alert severity="info">No follow-ups recorded yet.</Alert>
          )}
          {value.followUps.map((item) => (
            <FollowUpCard
              key={item.id}
              item={item}
              readOnly={readOnly}
              busy={interactionBlocked}
              actions={actions}
            />
          ))}
        </>
      )}
    </Stack>
  );
}

export function FollowUpCard({
  item,
  readOnly,
  busy,
  actions,
  compact = false,
  onBusyChange,
  onDirtyChange,
}: {
  item: InquiryFollowUp;
  readOnly: boolean;
  busy: boolean;
  actions: InquiryFollowUpActions;
  compact?: boolean;
  onBusyChange?: (id: string, busy: boolean) => void;
  onDirtyChange?: (id: string, dirty: boolean) => void;
}) {
  const [note, setNote] = useState('');
  const [finishing, setFinishing] = useState<'complete' | 'cancel' | null>(null);
  const submitting = useRef(false);
  useEffect(() => {
    onBusyChange?.(item.id, finishing !== null);
    return () => onBusyChange?.(item.id, false);
  }, [item.id, finishing, onBusyChange]);
  useEffect(() => {
    onDirtyChange?.(item.id, Boolean(note));
    return () => onDirtyChange?.(item.id, false);
  }, [item.id, note, onDirtyChange]);
  const finish = async (cancelled: boolean) => {
    if (readOnly || busy || submitting.current || !note.trim() || item.status !== 0) return;
    submitting.current = true;
    setFinishing(cancelled ? 'cancel' : 'complete');
    try {
      await (cancelled ? actions.cancel : actions.complete)(item, note.trim());
      setNote('');
      shikshaMitraToast.success({
        message: cancelled ? 'Follow-up cancelled' : 'Follow-up completed',
      });
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      shikshaMitraToast.error({
        message:
          problem.detail === 'Something went wrong'
            ? 'The follow-up changed. Reload and try again.'
            : problem.detail,
      });
    } finally {
      submitting.current = false;
      setFinishing(null);
    }
  };
  return (
    <Paper variant="outlined" sx={compact ? { py: 0.5, border: 0, borderRadius: 0 } : { p: 1.25 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}
          >
            {item.purpose}
          </Typography>
          <Label color={item.status === 0 ? 'warning' : item.status === 1 ? 'success' : 'default'}>
            {['Scheduled', 'Completed', 'Cancelled'][item.status]}
          </Label>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {fDateTime(item.scheduledAt)}
        </Typography>
        {item.completionNote && (
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {item.completionNote}
          </Typography>
        )}
        {item.status === 0 && !readOnly && (
          <>
            <TextField
              size="small"
              label="Completion or cancellation note *"
              value={note}
              disabled={busy}
              onChange={(event) => setNote(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 1024 } }}
            />
            <Stack direction="row" spacing={1}>
              <LoadingButton
                size="small"
                variant="outlined"
                loading={finishing === 'complete'}
                disabled={busy || !note.trim()}
                onClick={() => finish(false)}
                sx={compact ? undefined : { minHeight: 44 }}
              >
                Complete
              </LoadingButton>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={busy || !note.trim()}
                onClick={() => finish(true)}
                sx={compact ? undefined : { minHeight: 44 }}
              >
                Cancel
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
