import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { Alert, Stack, Button, TextField, Typography } from '@mui/material';

import { formatAdmissionReference } from './admission-reference';
import { canLinkAdmissionInquiryFamily } from './admission-inquiry-model';

type Props = {
  matches: DuplicateMatch[];
  guardianPhone: string;
  busy: boolean;
  onUseExisting: (familyId: string) => void;
  onOpenExisting: (inquiryId: string) => void;
  onCreateSeparate: () => void;
  overrideReason: string;
  onOverrideReasonChange: (value: string) => void;
};

export function AdmissionInquiryDuplicateMatches({
  matches,
  guardianPhone,
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
      {matches.map((match) => {
        const canLink = canLinkAdmissionInquiryFamily(match, guardianPhone);
        return (
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
                <Button
                  size="small"
                  disabled={busy || !canLink}
                  onClick={() => onUseExisting(match.familyId)}
                >
                  Add sibling
                </Button>
              </Stack>
            }
          >
            Possible existing family: {match.applicantName} · {match.guardianPhone ?? '—'}
            {match.existingInquiryNumber
              ? ` · ${formatAdmissionReference(match.existingInquiryNumber)}`
              : ''}
            {!canLink && (
              <Typography variant="body2">
                {match.canLinkFamily === false && match.guardianPhone === guardianPhone
                  ? 'This family is not available for linking. Review the existing inquiry or create a separate family.'
                  : 'Guardian mobile does not match. Verify the number before adding a sibling.'}
              </Typography>
            )}
          </Alert>
        );
      })}
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
