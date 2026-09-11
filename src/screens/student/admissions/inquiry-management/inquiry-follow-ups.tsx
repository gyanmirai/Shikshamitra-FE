import type {
  InquiryFollowUp,
  AdmissionInquiryManagement,
} from 'src/redux/student/admissions/admission-inquiry-management-api';

import { useState } from 'react';
import { fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Chip, Paper, Stack, Button, TextField, Typography } from '@mui/material';
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
  const [purpose, setPurpose] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [schedule, scheduling] = useScheduleAdmissionInquiryFollowUpMutation();
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">
        Follow-ups · {value.followUps.filter((item) => item.status === 0).length} open
      </Typography>
      {!readOnly && (
        <>
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Next follow-up *"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            size="small"
            label="Purpose *"
            value={purpose}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 512 } }}
            onChange={(event) => setPurpose(event.target.value)}
          />
          <LoadingButton
            variant="outlined"
            loading={scheduling.isLoading}
            disabled={!purpose.trim() || !scheduledAt}
            onClick={() =>
              schedule({
                inquiryId: value.inquiryId,
                concurrencyStamp: value.concurrencyStamp,
                scheduledAt: new Date(scheduledAt).toISOString(),
                purpose: purpose.trim(),
              })
                .unwrap()
                .then(() => {
                  setPurpose('');
                  setScheduledAt('');
                  shikshaMitraToast.success({ message: 'Follow-up scheduled' });
                })
                .catch(() =>
                  shikshaMitraToast.error({
                    message: 'Follow-up could not be scheduled. Reload and try again.',
                  })
                )
            }
          >
            Schedule follow-up
          </LoadingButton>
        </>
      )}
      {value.followUps.map((item) => (
        <FollowUpCard key={item.id} inquiry={value} item={item} readOnly={readOnly} />
      ))}
    </Stack>
  );
}

function FollowUpCard({
  inquiry,
  item,
  readOnly,
}: {
  inquiry: AdmissionInquiryManagement;
  item: InquiryFollowUp;
  readOnly: boolean;
}) {
  const [note, setNote] = useState('');
  const [complete, completing] = useCompleteAdmissionInquiryFollowUpMutation();
  const [cancel, cancelling] = useCancelAdmissionInquiryFollowUpMutation();
  const finish = (cancelled: boolean) =>
    (cancelled ? cancel : complete)({
      inquiryId: inquiry.inquiryId,
      followUpId: item.id,
      concurrencyStamp: inquiry.concurrencyStamp,
      followUpConcurrencyStamp: item.concurrencyStamp,
      note: note.trim(),
    })
      .unwrap()
      .then(() => {
        setNote('');
        shikshaMitraToast.success({
          message: cancelled ? 'Follow-up cancelled' : 'Follow-up completed',
        });
      })
      .catch(() =>
        shikshaMitraToast.error({ message: 'The follow-up changed. Reload and try again.' })
      );
  return (
    <Paper variant="outlined" sx={{ p: 1.25 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
            {item.purpose}
          </Typography>
          <Chip size="small" label={['Scheduled', 'Completed', 'Cancelled'][item.status]} />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {fDateTime(item.scheduledAt)}
        </Typography>
        {item.status === 0 && !readOnly && (
          <>
            <TextField
              size="small"
              label="Completion or cancellation note *"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 1024 } }}
            />
            <Stack direction="row" spacing={1}>
              <LoadingButton
                size="small"
                loading={completing.isLoading}
                disabled={!note.trim()}
                onClick={() => finish(false)}
              >
                Complete
              </LoadingButton>
              <Button
                size="small"
                color="error"
                disabled={!note.trim() || cancelling.isLoading}
                onClick={() => finish(true)}
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
