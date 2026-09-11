import type { AdmissionInquiryManagement } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { useRecordAdmissionInquiryContactMutation } from 'src/redux/student/admissions/admission-inquiry-management-api';

export function InquiryContactForm({ value }: { value: AdmissionInquiryManagement }) {
  const [note, setNote] = useState('');
  const [record, state] = useRecordAdmissionInquiryContactMutation();
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Record contact</Typography>
      <TextField
        fullWidth
        multiline
        minRows={2}
        size="small"
        label="Contact note *"
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
        Save contact
      </LoadingButton>
    </Stack>
  );
}
