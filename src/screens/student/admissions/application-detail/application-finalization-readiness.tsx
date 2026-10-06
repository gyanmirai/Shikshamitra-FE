import type { AdmissionFinalizationPreview } from 'src/redux/student/admissions/admission-applications-api';

import {
  Alert,
  Stack,
  Radio,
  Button,
  Skeleton,
  Typography,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';

type Props = {
  applicantId: string;
  preview?: AdmissionFinalizationPreview;
  loading: boolean;
  hasError: boolean;
  disabled?: boolean;
  identityChoice: string;
  onIdentityChoice: (value: string) => void;
  onRetry: () => void;
};

export function ApplicationFinalizationReadiness({
  applicantId,
  preview,
  loading,
  hasError,
  disabled = false,
  identityChoice,
  onIdentityChoice,
  onRetry,
}: Props) {
  return (
    <>
      {loading && (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={72} />
          <Skeleton variant="rounded" height={120} />
        </Stack>
      )}
      {hasError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" disabled={disabled} onClick={onRetry}>
              Retry
            </Button>
          }
        >
          Finalization readiness could not be loaded.
        </Alert>
      )}
      {preview?.items.map((item) => (
        <Alert
          key={item.key}
          severity={
            item.passed ? 'success' : item.key === 'duplicate_resolution' ? 'warning' : 'error'
          }
        >
          <Typography variant="subtitle2">{item.label}</Typography>
          <Typography variant="body2">{item.detail}</Typography>
          {!item.passed && item.key === 'identity' && (
            <Button
              href={`/student/admissions/applicants/${applicantId}`}
              size="small"
              disabled={disabled}
              sx={{ mt: 0.5 }}
            >
              Repair applicant identity
            </Button>
          )}
        </Alert>
      ))}
      {preview && preview.possibleMatches.length > 0 && !preview.linkedStudentId && (
        <Stack spacing={1}>
          <Typography variant="subtitle2">Resolve possible Student matches</Typography>
          <RadioGroup
            value={identityChoice}
            onChange={(event) => onIdentityChoice(event.target.value)}
          >
            {preview.possibleMatches.map((match) => (
              <FormControlLabel
                key={match.studentId}
                disabled={disabled}
                value={match.studentId}
                control={<Radio />}
                label={`${match.studentName}${match.grNumber ? ` · GR ${match.grNumber}` : ''}`}
              />
            ))}
            <FormControlLabel
              disabled={disabled}
              value="new"
              control={<Radio />}
              label="None match — create a new Student identity"
            />
          </RadioGroup>
          <Alert severity="warning">
            Approximate matches are never merged automatically. Confirm the correct identity
            explicitly.
          </Alert>
        </Stack>
      )}
    </>
  );
}
