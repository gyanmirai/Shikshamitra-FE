import type { AdmissionFinalizationPreview } from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import {
  Box,
  Stack,
  Radio,
  Button,
  Divider,
  Skeleton,
  Typography,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';

type Props = {
  preview?: AdmissionFinalizationPreview;
  loading: boolean;
  hasError: boolean;
  disabled?: boolean;
  identityChoice: string;
  onIdentityChoice: (value: string) => void;
  onRetry: () => void;
  onRepairIdentity?: () => void;
};

export function ApplicationFinalizationReadiness({
  preview,
  loading,
  hasError,
  disabled = false,
  identityChoice,
  onIdentityChoice,
  onRetry,
  onRepairIdentity,
}: Props) {
  return (
    <>
      {loading && (
        <Stack spacing={1} role="status" aria-label="Loading finalization readiness">
          <Skeleton variant="rounded" height={40} />
          <Skeleton variant="rounded" height={160} />
        </Stack>
      )}
      {hasError && (
        <StudentFeedback
          notificationKey="STU-0195"
          presentation="persistent"
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Iconify icon="mdi:refresh" />}
              disabled={disabled || loading}
              onClick={onRetry}
            >
              Retry
            </Button>
          }
        >
          Finalization readiness could not be loaded.
        </StudentFeedback>
      )}
      {!loading && !hasError && !preview?.items.length && (
        <StudentFeedback
          notificationKey="STU-0196"
          presentation="persistent"
          severity="warning"
          action={
            <Button
              size="small"
              color="inherit"
              disabled={disabled}
              onClick={onRetry}
              startIcon={<Iconify icon="mdi:refresh" />}
            >
              Retry
            </Button>
          }
        >
          Finalization readiness is unavailable. Reload the checks before finalizing.
        </StudentFeedback>
      )}
      {!loading && !hasError && Boolean(preview?.items.length) && (
        <Stack spacing={1}>
          <Typography variant="subtitle1" component="h3">
            Finalization checks
          </Typography>
          <Divider />
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
            {preview?.items.map((item) => (
              <Box
                component="li"
                key={item.key}
                sx={(theme) => ({
                  p: 1,
                  border: 1,
                  borderColor: item.passed
                    ? 'divider'
                    : item.key === 'duplicate_resolution'
                      ? 'warning.main'
                      : 'error.main',
                  borderRadius: 1,
                  bgcolor: item.passed
                    ? 'transparent'
                    : alpha(
                        theme.palette[item.key === 'duplicate_resolution' ? 'warning' : 'error']
                          .main,
                        0.08
                      ),
                })}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Iconify
                    icon={item.passed ? 'mdi:check-circle' : 'mdi:alert-circle-outline'}
                    width={22}
                    sx={{
                      flexShrink: 0,
                      color: item.passed
                        ? 'success.main'
                        : item.key === 'duplicate_resolution'
                          ? 'warning.main'
                          : 'error.main',
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0, flex: 1 }}>
                    {item.key === 'identity' && !item.passed ? 'Core identity' : item.label}
                  </Typography>
                  <Label
                    color={
                      item.passed
                        ? 'success'
                        : item.key === 'duplicate_resolution'
                          ? 'warning'
                          : 'error'
                    }
                    sx={{ flexShrink: 0 }}
                  >
                    {item.passed ? 'Ready' : 'Needs attention'}
                  </Label>
                </Stack>
                {(!item.passed || item.detail !== 'Ready') && (
                  <Typography
                    variant="caption"
                    color={item.passed ? 'text.secondary' : 'text.primary'}
                    sx={{ mt: 0.5, ml: 3.75, display: 'block', overflowWrap: 'anywhere' }}
                  >
                    {item.detail}
                  </Typography>
                )}
                {!item.passed && item.key === 'identity' && onRepairIdentity && (
                  <Button
                    size="small"
                    disabled={disabled}
                    onClick={onRepairIdentity}
                    startIcon={<Iconify icon="mdi:account-edit-outline" />}
                    variant="outlined"
                    color="inherit"
                    sx={{ mt: 0.5, ml: 3.75 }}
                  >
                    Repair applicant identity
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Stack>
      )}
      {!loading &&
        !hasError &&
        preview &&
        preview.possibleMatches.length > 0 &&
        !preview.linkedStudentId && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Resolve possible Student matches</Typography>
            <RadioGroup
              value={identityChoice}
              onChange={(event) => onIdentityChoice(event.target.value)}
              aria-label="Student identity"
              sx={{
                '& .MuiFormControlLabel-root': { mx: 0, py: 0.25 },
                '& .MuiFormControlLabel-label': { typography: 'body2', overflowWrap: 'anywhere' },
              }}
            >
              {preview.possibleMatches.map((match) => (
                <FormControlLabel
                  key={match.studentId}
                  disabled={disabled}
                  value={match.studentId}
                  control={<Radio size="small" />}
                  label={`${match.studentName}${match.grNumber ? ` · GR ${match.grNumber}` : ''}`}
                />
              ))}
              <FormControlLabel
                disabled={disabled}
                value="new"
                control={<Radio size="small" />}
                label="None match — create a new Student identity"
              />
            </RadioGroup>
            <Typography variant="caption" color="text.secondary">
              Approximate matches are never merged automatically. Confirm the correct identity
              explicitly.
            </Typography>
          </Stack>
        )}
    </>
  );
}
