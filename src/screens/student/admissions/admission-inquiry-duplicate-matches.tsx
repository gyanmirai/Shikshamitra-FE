import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { Alert, Stack, Button } from '@mui/material';

type Props = {
  matches: DuplicateMatch[];
  busy: boolean;
  onUseExisting: (familyId: string) => void;
  onCreateSeparate: () => void;
};

export function AdmissionInquiryDuplicateMatches({
  matches,
  busy,
  onUseExisting,
  onCreateSeparate,
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
      <Button variant="outlined" disabled={busy} onClick={onCreateSeparate}>
        Create separate family
      </Button>
    </Stack>
  );
}
