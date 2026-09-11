import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { Alert, Stack, Button, TextField } from '@mui/material';

type Props = {
  matches: DuplicateMatch[];
  busy: boolean;
  onUseExisting: (familyId: string) => void;
  onCreateSeparate: () => void;
  overrideReason: string;
  onOverrideReasonChange: (value: string) => void;
};

export function AdmissionInquiryDuplicateMatches({
  matches,
  busy,
  onUseExisting,
  onCreateSeparate,
  overrideReason,
  onOverrideReasonChange,
}: Props) {
  if (!matches.length) return null;
  return (
    <Stack spacing={1}>
      {matches.map((match) => (
        <Alert
          key={`${match.familyId}-${match.applicantId}`}
          severity="warning"
          action={
            <Button size="small" disabled={busy} onClick={() => onUseExisting(match.familyId)}>
              Use existing family
            </Button>
          }
        >
          Possible existing family: {match.applicantName} · {match.guardianPhone ?? '—'}
        </Alert>
      ))}
      <TextField
        fullWidth
        size="small"
        multiline
        minRows={2}
        label="Reason for creating a separate family"
        value={overrideReason}
        onChange={(event) => onOverrideReasonChange(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 512 } }}
        helperText="Some managed workflows require this explanation."
      />
      <Button
        variant="outlined"
        disabled={busy}
        onClick={onCreateSeparate}
      >
        Create separate family
      </Button>
    </Stack>
  );
}
