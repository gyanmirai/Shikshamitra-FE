import type { AdmissionInquiryManagement } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { useRecordAdmissionInquiryContactMutation } from 'src/redux/student/admissions/admission-inquiry-management-api';

export function InquiryContactForm({ value }: { value: AdmissionInquiryManagement }) {
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState('PHONE');
  const [direction, setDirection] = useState('OUTBOUND');
  const [outcome, setOutcome] = useState('CONNECTED');
  const [record, state] = useRecordAdmissionInquiryContactMutation();
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Record Contact</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <CustomSelect
          fullWidth
          size="small"
          label="Channel *"
          value={channel}
          options={[
            { value: 'PHONE', label: 'Phone Call' },
            { value: 'WHATSAPP', label: 'WhatsApp' },
            { value: 'SMS', label: 'SMS' },
            { value: 'EMAIL', label: 'Email' },
            { value: 'IN_PERSON', label: 'In Person' },
            { value: 'VIDEO', label: 'Video Call' },
          ]}
          onChange={(next) => setChannel(String(next))}
        />
        <CustomSelect
          fullWidth
          size="small"
          label="Direction *"
          value={direction}
          options={[
            { value: 'OUTBOUND', label: 'School Contacted Family' },
            { value: 'INBOUND', label: 'Family Contacted School' },
          ]}
          onChange={(next) => setDirection(String(next))}
        />
      </Stack>
      <CustomSelect
        fullWidth
        size="small"
        label="Contact Outcome *"
        value={outcome}
        options={[
          { value: 'CONNECTED', label: 'Connected' },
          { value: 'NO_ANSWER', label: 'No Answer' },
          { value: 'CALL_BACK', label: 'Call Back Requested' },
          { value: 'INFORMATION_SHARED', label: 'Information Shared' },
          { value: 'VISIT_PLANNED', label: 'School Visit Planned' },
          { value: 'OTHER', label: 'Other' },
        ]}
        onChange={(next) => setOutcome(String(next))}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        size="small"
        label="Contact Note *"
        value={note}
        slotProps={{ htmlInput: { maxLength: 1024 } }}
        onChange={(event) => setNote(event.target.value)}
        helperText="Record what was discussed and the next commitment."
      />
      <LoadingButton
        loading={state.isLoading}
        disabled={!note.trim()}
        variant="contained"
        onClick={() =>
          record({
            inquiryId: value.inquiryId,
            concurrencyStamp: value.concurrencyStamp,
            channel,
            direction,
            outcome,
            note: note.trim(),
          })
            .unwrap()
            .then(() => {
              setNote('');
              shikshaMitraToast.success({ message: 'Contact recorded' });
            })
            .catch(() =>
              shikshaMitraToast.error({
                message:
                  'The inquiry changed or contact could not be recorded. Reload and try again.',
              })
            )
        }
      >
        Save Contact
      </LoadingButton>
    </Stack>
  );
}
