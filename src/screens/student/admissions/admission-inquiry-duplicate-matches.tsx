import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { Alert, Stack, Button, TextField } from '@mui/material';

import { formatAdmissionReference } from './admission-reference';

type Props = {
  matches: DuplicateMatch[];
  busy: boolean;
  onUseExisting: (familyId: string) => void;
  onOpenExisting: (inquiryId: string) => void;
  onCreateSeparate: () => void;
  overrideReason: string;
  onOverrideReasonChange: (value: string) => void;
};

export function AdmissionInquiryDuplicateMatches({
  matches,
  busy,
  onUseExisting,
  onOpenExisting,
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
            <Stack direction="row" spacing={0.5}>
              {match.existingInquiryId && (
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => onOpenExisting(match.existingInquiryId!)}
                >
                  Open inquiry
                </Button>
              )}
              <Button size="small" disabled={busy} onClick={() => onUseExisting(match.familyId)}>
                Add sibling
              </Button>
            </Stack>
          }
        >
          Possible existing family: {match.applicantName} · {match.guardianPhone ?? '—'}
          {match.existingInquiryNumber
            ? ` · ${formatAdmissionReference(match.existingInquiryNumber)}`
            : ''}
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
      <Button variant="outlined" disabled={busy} onClick={onCreateSeparate}>
        Create separate family
      </Button>
    </Stack>
  );
}
