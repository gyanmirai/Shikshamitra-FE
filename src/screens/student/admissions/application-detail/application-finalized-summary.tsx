'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionApplication,
  AdmissionApplicationWorkflow,
  AdmissionApplicationDecisionHistory,
} from 'src/redux/student/admissions/admission-applications-api';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomAccordion from 'src/components/custom-accordian';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import { Box, Paper, Stack, Button, Divider, Skeleton, Typography } from '@mui/material';
import { useGetStudentOnboardingCaseQuery } from 'src/redux/student/onboarding/student-onboarding-api';

import { ApplicationDecisionHistory } from './application-decision-history';
import { formatWorkflowDateTime } from '../workflow-list/workflow-list-format';
import { ApplicationFinalizedEvidence } from './application-finalized-evidence';
import { ApplicationOnboardingHandover } from './application-onboarding-handover';

type Props = {
  application: AdmissionApplication;
  workflow?: AdmissionApplicationWorkflow;
  history?: AdmissionApplicationDecisionHistory[];
  historyLoading: boolean;
  historyError: boolean;
  onRetryHistory: () => void;
  navigationDisabled?: boolean;
  hideActions?: boolean;
};

export function ApplicationFinalizedSummary({
  application,
  workflow,
  history,
  historyLoading,
  historyError,
  onRetryHistory,
  navigationDisabled = false,
  hideActions = false,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewOnboarding = hasGrantedPermission(permissions, studentPermissions.onboarding.setup);
  const caseQuery = useGetStudentOnboardingCaseQuery(application.onboardingCaseId ?? '', {
    skip: !application.onboardingCaseId || !canViewOnboarding,
    refetchOnMountOrArgChange: true,
  });
  // currentData prevents a previous applicant's handover appearing during navigation.
  const onboardingCase =
    canViewOnboarding &&
    !caseQuery.isError &&
    caseQuery.currentData?.applicationId === application.id
      ? caseQuery.currentData
      : undefined;
  const caseLoading = caseQuery.isLoading || (caseQuery.isFetching && !onboardingCase);
  const expanded = useBoolean();
  const finalization = historyError
    ? undefined
    : history
        ?.filter((item) => item.status === 11)
        .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))[0];
  const unavailable = !canViewOnboarding ? 'Onboarding access required' : 'Not available';
  const academicValue = (value?: string | null) =>
    caseLoading ? <Skeleton width="75%" /> : value || unavailable;

  return (
    <Stack id="admission-decision" spacing={1.5} sx={{ p: 1.5, minWidth: 0 }}>
      <Typography variant="h6" component="h2">
        Admission finalized
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) minmax(0, 1fr)' },
          gap: 1.5,
        }}
      >
        <Paper variant="outlined" sx={{ p: 1.5, minWidth: 0, boxShadow: 'none' }}>
          <Typography variant="subtitle1" component="h3">
            Admission summary
          </Typography>
          <Divider sx={{ mt: 1 }} />
          <Box component="dl" sx={{ m: 0 }}>
            {[
              [
                'Student',
                onboardingCase?.studentName || application.applicantName || 'Not recorded',
              ],
              ['Application', application.applicationNumber],
              [
                'Class / Academic year',
                academicValue(
                  onboardingCase
                    ? `${onboardingCase.intendedStandardName || application.standardName || 'Not recorded'} / ${onboardingCase.academicYearName || 'Not recorded'}`
                    : undefined
                ),
              ],
              [
                'Board / Medium',
                academicValue(
                  onboardingCase
                    ? `${onboardingCase.intendedBoardName || 'Not recorded'} / ${onboardingCase.intendedMediumName || 'Not recorded'}`
                    : undefined
                ),
              ],
              [
                'Finalized on',
                application.finalizedAt
                  ? formatWorkflowDateTime(application.finalizedAt)
                  : 'Not recorded',
              ],
              [
                'Finalized by',
                historyLoading ? (
                  <Skeleton width="65%" />
                ) : (
                  finalization?.actorName || (historyError ? 'History unavailable' : 'Not recorded')
                ),
              ],
            ].map(([label, value]) => (
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
                  sx={{ width: { sm: '42%' }, flexShrink: 0 }}
                >
                  {label}
                </Typography>
                <Typography
                  component="dd"
                  variant="body2"
                  sx={{ m: 0, minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}
                >
                  {value}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Paper>
        <ApplicationOnboardingHandover
          onboardingCase={onboardingCase}
          hasCase={Boolean(application.onboardingCaseId)}
          canView={canViewOnboarding}
          loading={caseLoading}
          refreshing={caseQuery.isFetching && Boolean(onboardingCase)}
          error={caseQuery.isError}
          onRetry={() => caseQuery.refetch()}
        />
      </Box>
      <ApplicationFinalizedEvidence
        applicationId={application.id}
        workflow={workflow}
        finalizationRecorded={Boolean(finalization)}
      />
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <CustomAccordion
          title="Decision & finalization history"
          expanded={expanded.value}
          onChange={expanded.onToggle}
          content={
            <ApplicationDecisionHistory
              compact
              isLoading={historyLoading}
              isError={historyError}
              data={history}
              onRetry={onRetryHistory}
            />
          }
        />
      </Box>
      {!hideActions && (
        <ApplicationFinalizedActions application={application} disabled={navigationDisabled} />
      )}
    </Stack>
  );
}

export function ApplicationFinalizedActions({
  application,
  disabled,
  onBack,
  backLabel = 'Back to Applications',
}: {
  application: AdmissionApplication;
  disabled?: boolean;
  onBack?: () => void;
  backLabel?: string;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canContinue =
    hasGrantedPermission(permissions, studentPermissions.onboarding.setup) &&
    Boolean(application.onboardingCaseId);
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={{ width: 1, alignItems: { sm: 'center' }, justifyContent: 'flex-end' }}
    >
      {onBack ? (
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          disabled={disabled}
          startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={onBack}
        >
          {backLabel}
        </Button>
      ) : null}
      {canContinue ? (
        <Button
          component={disabled ? 'button' : Link}
          href={
            disabled
              ? undefined
              : `${studentPaths.onboarding.setup}?search=${encodeURIComponent(application.applicationNumber)}`
          }
          size="small"
          color="inherit"
          variant="contained"
          disabled={disabled}
          endIcon={<Iconify icon="mdi:arrow-right" />}
        >
          Continue onboarding
        </Button>
      ) : (
        <Label color="default">
          {application.onboardingCaseId
            ? 'Onboarding access required'
            : 'Onboarding case unavailable'}
        </Label>
      )}
    </Stack>
  );
}
