import type {
  InquiryFollowUp,
  AdmissionInquiryManagement,
} from 'src/redux/student/admissions/admission-inquiry-management-api';

import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomAccordion from 'src/components/custom-accordian';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Chip, Alert, Paper, Stack, Button, TextField, Typography } from '@mui/material';
import {
  useCancelAdmissionInquiryFollowUpMutation,
  useScheduleAdmissionInquiryFollowUpMutation,
  useCompleteAdmissionInquiryFollowUpMutation,
} from 'src/redux/student/admissions/admission-inquiry-management-api';

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
  const [purpose, setPurpose] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const submitting = useRef(false);
  const history = useBoolean();
  const interactionBlocked = busy || disabled;
  const schedule = async () => {
    if (readOnly || interactionBlocked || submitting.current || !purpose.trim() || !scheduledAt)
      return;
    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return;
    submitting.current = true;
    setScheduling(true);
    try {
      await actions.schedule({ scheduledAt: scheduledDate.toISOString(), purpose: purpose.trim() });
      setPurpose('');
      setScheduledAt('');
      shikshaMitraToast.success({ message: 'Follow-up scheduled' });
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      shikshaMitraToast.error({
        message:
          problem.detail === 'Something went wrong'
            ? 'Follow-up could not be scheduled. Reload and try again.'
            : problem.detail,
      });
    } finally {
      submitting.current = false;
      setScheduling(false);
    }
  };
  return (
    <Stack spacing={1.5}>
      {compact && !readOnly && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="mdi:calendar-clock-outline" width={20} />
          <Typography variant="subtitle2">Schedule follow-up</Typography>
        </Stack>
      )}
      {!compact && (
        <Typography variant="subtitle2">
          Follow-ups · {value.followUps.filter((item) => item.status === 0).length} open
        </Typography>
      )}
      {!readOnly && (
        <Box
          sx={
            compact
              ? {
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    sm: 'minmax(0, 1fr) minmax(0, 1.5fr) auto',
                  },
                  gap: 1,
                  alignItems: 'start',
                }
              : { display: 'flex', flexDirection: 'column', gap: 1.5 }
          }
        >
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Next follow-up *"
            value={scheduledAt}
            disabled={interactionBlocked}
            onChange={(event) => setScheduledAt(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            size="small"
            label="Purpose *"
            value={purpose}
            disabled={interactionBlocked}
            multiline={!compact}
            minRows={compact ? undefined : 2}
            slotProps={{ htmlInput: { maxLength: 512 } }}
            onChange={(event) => setPurpose(event.target.value)}
          />
          <LoadingButton
            variant="outlined"
            size={compact ? 'small' : undefined}
            loading={scheduling}
            disabled={interactionBlocked || !purpose.trim() || !scheduledAt}
            onClick={schedule}
            sx={compact ? { alignSelf: 'start', justifySelf: 'start' } : { minHeight: 44 }}
          >
            Schedule follow-up
          </LoadingButton>
        </Box>
      )}
      {compact ? (
        <CustomAccordion
          title={`Follow-ups / History · ${value.followUps.filter((item) => item.status === 0).length} open`}
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

function FollowUpCard({
  item,
  readOnly,
  busy,
  actions,
  compact = false,
}: {
  item: InquiryFollowUp;
  readOnly: boolean;
  busy: boolean;
  actions: InquiryFollowUpActions;
  compact?: boolean;
}) {
  const [note, setNote] = useState('');
  const [finishing, setFinishing] = useState<'complete' | 'cancel' | null>(null);
  const submitting = useRef(false);
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
          <Chip size="small" label={['Scheduled', 'Completed', 'Cancelled'][item.status]} />
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
                loading={finishing === 'complete'}
                disabled={busy || !note.trim()}
                onClick={() => finish(false)}
                sx={compact ? undefined : { minHeight: 44 }}
              >
                Complete
              </LoadingButton>
              <Button
                size="small"
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
