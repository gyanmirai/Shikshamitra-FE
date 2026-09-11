import type {
  InquiryOutcome,
  AdmissionInquiryManagement,
  InquiryQualificationAnswer,
} from 'src/redux/student/admissions/admission-inquiry-management-api';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Alert,
  Paper,
  Stack,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useQualifyAdmissionInquiryMutation,
  useReopenAdmissionInquiryQualificationMutation,
} from 'src/redux/student/admissions/admission-inquiry-management-api';

const outcomes = [
  { value: 0, label: 'Qualified' },
  { value: 1, label: 'Follow-up required' },
  { value: 2, label: 'Not interested' },
  { value: 3, label: 'Lost' },
  { value: 4, label: 'Duplicate' },
];

export function InquiryQualificationForm({ value }: { value: AdmissionInquiryManagement }) {
  const [outcome, setOutcome] = useState<InquiryOutcome>(value.outcome ?? 0);
  const [reason, setReason] = useState('');
  const [duplicateOfId, setDuplicateOfId] = useState('');
  const [answers, setAnswers] = useState<InquiryQualificationAnswer[]>(() =>
    (value.policy?.qualificationChecklist ?? []).map((item) => ({
      code: item.code,
      passed:
        value.qualificationAnswers.find((answer) => answer.code === item.code)?.passed ?? false,
    }))
  );
  const [qualify, qualifying] = useQualifyAdmissionInquiryMutation();
  const [reopen, reopening] = useReopenAdmissionInquiryQualificationMutation();
  const setPassed = (code: string, passed: boolean) =>
    setAnswers((current) =>
      current.map((answer) => (answer.code === code ? { ...answer, passed } : answer))
    );
  const requiredPassed = (value.policy?.qualificationChecklist ?? [])
    .filter((item) => item.required)
    .every((item) => answers.find((answer) => answer.code === item.code)?.passed);
  if (value.outcome != null)
    return (
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">Qualification outcome</Typography>
        <Alert severity="success">
          An outcome is recorded. Reopen it only when new information requires another
          qualification.
        </Alert>
        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          label="Reason for reopening *"
          value={reason}
          slotProps={{ htmlInput: { maxLength: 1024 } }}
          onChange={(event) => setReason(event.target.value)}
        />
        <LoadingButton
          loading={reopening.isLoading}
          variant="outlined"
          disabled={!reason.trim()}
          onClick={() =>
            reopen({
              inquiryId: value.inquiryId,
              concurrencyStamp: value.concurrencyStamp,
              reason: reason.trim(),
            })
              .unwrap()
              .then(() => {
                setReason('');
                shikshaMitraToast.success({ message: 'Qualification reopened' });
              })
              .catch(() =>
                shikshaMitraToast.error({
                  message: 'Qualification could not be reopened. Reload and try again.',
                })
              )
          }
        >
          Reopen qualification
        </LoadingButton>
      </Stack>
    );
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Qualification outcome</Typography>
      {(value.policy?.qualificationChecklist ?? []).map((item) => (
        <Paper key={item.code} variant="outlined" sx={{ px: 1.25 }}>
          <FormControlLabel
            label={`${item.name}${item.required ? ' *' : ''}`}
            control={
              <Checkbox
                checked={answers.find((answer) => answer.code === item.code)?.passed ?? false}
                onChange={(_, passed) => setPassed(item.code, passed)}
              />
            }
          />
        </Paper>
      ))}
      <CustomSelect
        fullWidth
        size="small"
        label="Outcome *"
        value={outcome}
        options={outcomes}
        onChange={(next) => setOutcome(Number(next) as InquiryOutcome)}
      />
      {outcome === 4 && (
        <TextField
          fullWidth
          size="small"
          label="Original inquiry ID *"
          value={duplicateOfId}
          onChange={(event) => setDuplicateOfId(event.target.value)}
          helperText="Use the original inquiry from the duplicate search."
        />
      )}
      <TextField
        fullWidth
        multiline
        minRows={2}
        size="small"
        label="Outcome reason *"
        value={reason}
        slotProps={{ htmlInput: { maxLength: 1024 } }}
        onChange={(event) => setReason(event.target.value)}
      />
      {outcome === 0 && !requiredPassed && (
        <Alert severity="warning">
          Complete every required checklist item before choosing Qualified.
        </Alert>
      )}
      {outcome === 1 && !value.followUps.some((item) => item.status === 0) && (
        <Alert severity="warning">
          Schedule the next follow-up before choosing Follow-up required.
        </Alert>
      )}
      <LoadingButton
        loading={qualifying.isLoading}
        variant="contained"
        disabled={
          !reason.trim() ||
          (outcome === 0 && !requiredPassed) ||
          (outcome === 1 && !value.followUps.some((item) => item.status === 0)) ||
          (outcome === 4 && !duplicateOfId)
        }
        onClick={() =>
          qualify({
            inquiryId: value.inquiryId,
            concurrencyStamp: value.concurrencyStamp,
            outcome,
            reason: reason.trim(),
            duplicateOfId: outcome === 4 ? duplicateOfId : null,
            answers,
          })
            .unwrap()
            .then(() => {
              setReason('');
              shikshaMitraToast.success({ message: 'Qualification outcome saved' });
            })
            .catch(() =>
              shikshaMitraToast.error({
                message: 'The inquiry changed or the outcome is invalid. Reload and try again.',
              })
            )
        }
      >
        Save outcome
      </LoadingButton>
    </Stack>
  );
}
