import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { StudentFeedback } from 'src/components/student-feedback';
import {
  Box,
  Paper,
  Stack,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';

import {
  onboardingCaseStage,
  onboardingStageMeta,
} from '../../onboarding/student-setup/student-onboarding-model';

type Props = {
  onboardingCase?: StudentOnboardingCase;
  hasCase: boolean;
  canView: boolean;
  loading: boolean;
  refreshing: boolean;
  error: boolean;
  onRetry: () => void;
};

export function ApplicationOnboardingHandover({
  onboardingCase: value,
  hasCase,
  canView,
  loading,
  refreshing,
  error,
  onRetry,
}: Props) {
  const meta = value ? onboardingStageMeta[onboardingCaseStage[value.status]] : undefined;
  // ActivateAsync stores this reference after creating the active enrollment.
  // completedAt is later: it records completion of the remaining access handoffs.
  const activated = Boolean(value?.studentEnrollmentId);
  const nextAction =
    value?.status === 5
      ? value.cancellationReason || 'Onboarding was cancelled.'
      : value?.primaryBlocker ||
        value?.lastError ||
        (activated
          ? value?.credentialsPending || value?.status === 6
            ? 'Complete pending Credentials tasks in Student Onboarding.'
            : value?.status === 4
              ? 'Onboarding completed. Review the student in Student Records.'
              : 'Review remaining onboarding tasks in Student Onboarding.'
          : value?.steps.find((step) => step.required && [0, 1, 3].includes(step.status))?.label ||
            (value?.status === 2
              ? 'Ready to activate in Student Onboarding.'
              : 'Review readiness in Student Onboarding.'));

  return (
    <Paper
      component="section"
      aria-label="Onboarding handover"
      variant="outlined"
      sx={{ p: 1.5, minWidth: 0, boxShadow: 'none' }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} useFlexGap flexWrap="wrap">
        <Typography variant="subtitle1" component="h3">
          Onboarding handover
        </Typography>
        <CustomTooltip
          arrow
          describeChild
          title={
            <Box sx={{ p: 1 }}>
              Admission is complete. Continue Student Onboarding to prepare the student for
              activation. Placement, GR and roll numbers, fees and accounts are completed in Student
              Onboarding. Fee confirmation does not record payment.
            </Box>
          }
        >
          <IconButton
            size="small"
            aria-label="Admission handoff information"
            sx={{ color: 'info.main', minWidth: { xs: 44, sm: 30 }, minHeight: { xs: 44, sm: 30 } }}
          >
            <Iconify icon="mdi:information-outline" width={18} />
          </IconButton>
        </CustomTooltip>
        {meta && !error && <Label color={meta.color}>{meta.label}</Label>}
      </Stack>
      <Divider sx={{ mt: 1 }} />
      {!hasCase ? (
        <StudentFeedback
          notificationKey="STU-0201"
          presentation="persistent"
          severity="warning"
          sx={{ mt: 1.5 }}
        >
          No onboarding case is linked to this application.
        </StudentFeedback>
      ) : !canView ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Onboarding viewing access is required to see placement, identifiers and activation status.
        </Typography>
      ) : loading ? (
        <Stack spacing={1} sx={{ mt: 1.5 }} aria-label="Loading onboarding handover">
          <Skeleton height={32} />
          <Skeleton height={32} />
          <Skeleton height={32} />
          <Skeleton variant="rounded" height={56} />
        </Stack>
      ) : error || !value ? (
        <StudentFeedback
          notificationKey="STU-0202"
          presentation="toast"
          severity="error"
          sx={{ mt: 1.5 }}
          action={
            <Button size="small" color="inherit" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          Onboarding details could not be loaded.
        </StudentFeedback>
      ) : (
        <>
          {refreshing && (
            <LinearProgress aria-label="Refreshing onboarding handover" sx={{ mt: 1 }} />
          )}
          <Box component="dl" sx={{ m: 0 }}>
            {[
              [
                'Class / division placement',
                value.divisionName ? (
                  `${value.intendedStandardName} / ${value.divisionName}`
                ) : (
                  <Label color="warning">Pending</Label>
                ),
              ],
              [
                'GR / Roll number',
                <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                  <Typography variant="body2">GR: {value.grNumber || 'Not assigned'}</Typography>
                  <Typography variant="body2">
                    · Roll: {value.rollNumber ?? 'Not assigned'}
                  </Typography>
                </Stack>,
              ],
              [
                'Student activation',
                <Label color={activated ? 'success' : value.status === 5 ? 'default' : 'warning'}>
                  {activated ? 'Activated' : value.status === 5 ? 'Cancelled' : 'Pending'}
                </Label>,
              ],
            ].map(([label, content]) => (
              <Stack
                key={String(label)}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={0.5}
                sx={{ py: 1, '& + div': { borderTop: 1, borderColor: 'divider' } }}
              >
                <Typography
                  component="dt"
                  variant="body2"
                  color="text.secondary"
                  sx={{ width: { sm: '50%' }, flexShrink: 0 }}
                >
                  {label}
                </Typography>
                <Box component="dd" sx={{ m: 0, minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
                  {content}
                </Box>
              </Stack>
            ))}
          </Box>
          <Box sx={{ p: 1.5, mt: 1, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="subtitle2">Next action</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
            >
              {nextAction}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}
