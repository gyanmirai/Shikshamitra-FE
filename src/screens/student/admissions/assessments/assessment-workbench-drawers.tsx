import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';
import type {
  AssessmentRoster,
  AssessmentRosterItem,
} from 'src/redux/student/admissions/admission-assessment-roster-api';

import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Scrollbar } from 'src/components/scrollbar';
import { studentPaths } from 'src/constants/student-menu';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useGetApplicationAssessmentQuery } from 'src/redux/student/admissions/admission-assessments-api';
import {
  Box,
  Grid,
  Stack,
  Drawer,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import { assessmentGuidance } from './assessment-guidance';
import { AdmissionQueryError } from '../admission-query-error';
import { assessmentQueues } from './assessment-workbench-model';
import { AssessmentPanelActions } from './assessment-panel-actions';
import { AssessmentAttemptHistory } from './assessment-attempt-history';

import type { AssessmentAction } from './assessment-action-model';

function WorkbenchDrawer({
  title,
  onClose,
  children,
  detailView = false,
  helpText,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  detailView?: boolean;
  helpText?: string;
}) {
  const titleId = useId();
  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': titleId,
        sx: {
          width: { xs: 1, sm: detailView ? 720 : 560 },
          maxWidth: 1,
          ...(detailView && {
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }),
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={detailView ? { px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0 } : { p: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Typography
            id={titleId}
            variant="h6"
            component={detailView ? 'h2' : 'h6'}
            sx={{ overflowWrap: 'anywhere' }}
          >
            {title}
          </Typography>
          {helpText && <InfoTooltipIcon label={`${title} information`} title={helpText} />}
        </Stack>
        <IconButton
          size="small"
          sx={{ width: 44, height: 44, flexShrink: 0 }}
          aria-label={`Close ${title}`}
          onClick={onClose}
        >
          <Iconify icon={detailView ? GlobalIcons.cancel : 'mdi:close'} />
        </IconButton>
      </Stack>
      <Divider />
      <Scrollbar sx={{ minHeight: 0, ...(detailView && { flex: 1 }) }}>
        <Box sx={{ p: detailView ? { xs: 2, sm: 3 } : 2 }}>{children}</Box>
      </Scrollbar>
    </Drawer>
  );
}

export function AssessmentInsightsDrawer({
  counts,
  scope,
  sessionName,
  loading,
  error,
  onRetry,
  onClose,
}: {
  counts?: AssessmentRoster['counts'];
  scope?: AssessmentScope;
  sessionName?: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <WorkbenchDrawer title="Assessment Insights" onClose={onClose}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {scope
            ? `${scope.offeringName} · ${scope.stageName}`
            : 'All Allowed Offerings and Stages'}
          {sessionName ? ` · ${sessionName}` : ''}. Counts use the current session and applicant
          search.
        </Typography>
        {error ? (
          <AdmissionQueryError onRetry={onRetry} />
        ) : loading && !counts ? (
          <Skeleton variant="rounded" height={200} />
        ) : (
          counts && (
            <Stack divider={<Divider />}>
              {assessmentQueues.map((item) => (
                <Stack
                  key={item.value}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ py: 1 }}
                >
                  <Typography variant="body2">{item.label}</Typography>
                  <Typography variant="subtitle2">{counts[item.value]}</Typography>
                </Stack>
              ))}
            </Stack>
          )
        )}
      </Stack>
    </WorkbenchDrawer>
  );
}

export function AssessmentApplicantDrawer({
  row,
  canViewApplication,
  canAdvance,
  onAction,
  returnUrl,
  onClose,
}: {
  row: AssessmentRosterItem;
  canViewApplication: boolean;
  canAdvance: boolean;
  onAction: (row: AssessmentRosterItem, action: AssessmentAction | 'continue') => void;
  returnUrl: string;
  onClose: () => void;
}) {
  const query = useGetApplicationAssessmentQuery(
    { applicationId: row.applicationId, stageInstanceId: row.stageInstanceId },
    { refetchOnMountOrArgChange: true }
  );
  return (
    <WorkbenchDrawer
      title="Assessment Details"
      onClose={onClose}
      detailView
      helpText="View the student's assessment, available actions and recorded attempts."
    >
      <Stack spacing={2}>
        <FormSectionCard
          title="Student Details"
          aria-label="Student Details"
          icon={GlobalIcons.studentProfile}
          descriptionTooltip="The student, application and assessment stage linked to this record."
          actionFullWidthOnMobile
          action={
            canViewApplication && (
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                sx={{ width: { xs: 1, md: 'auto' } }}
                href={`${studentPaths.enrollment.applications}/${row.applicationId}?returnTo=${encodeURIComponent(returnUrl)}`}
                startIcon={<Iconify icon={GlobalIcons.openInNew} />}
              >
                Open Application
              </Button>
            )
          }
        >
          <Grid container component="dl" spacing={2} sx={{ m: 0 }}>
            {[
              ['Student Name', row.applicantName],
              ['Application Number', row.applicationNumber],
              ['Assessment', row.stageName],
            ].map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
                <Typography component="dt" variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </FormSectionCard>
        {query.isError ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : !query.currentData ? (
          <Stack role="status" aria-label="Loading Assessment Details" aria-busy spacing={2}>
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={150} />
          </Stack>
        ) : (
          <>
            {((row.isActive && query.currentData.policy) ||
              query.currentData.blockers.length > 0) && (
              <FormSectionCard
                title="Assessment Actions"
                aria-label="Assessment Actions"
                icon={GlobalIcons.admissionDetails}
                descriptionTooltip="Available actions follow the current assessment rules and your access."
              >
                {row.isActive && query.currentData.policy && (
                  <AssessmentPanelActions
                    assessment={{ ...query.currentData, policy: query.currentData.policy }}
                    canAdvance={canAdvance}
                    disabled={query.isFetching}
                    emptyContent={
                      <Typography variant="body2" color="text.secondary">
                        No actions are available for this assessment.
                      </Typography>
                    }
                    onAction={(action) =>
                      onAction({ ...row, assessment: query.currentData! }, action)
                    }
                    onComplete={() =>
                      onAction({ ...row, assessment: query.currentData! }, 'continue')
                    }
                  />
                )}
                {!!query.currentData.blockers.length && (
                  <StudentFeedback
                    notificationKey="STU-0285"
                    presentation="inline"
                    severity="info"
                    role="status"
                  >
                    <Stack spacing={0.5}>
                      {assessmentGuidance(query.currentData.blockers).map((message) => (
                        <Typography key={message} variant="body2">
                          {message}
                        </Typography>
                      ))}
                    </Stack>
                  </StudentFeedback>
                )}
              </FormSectionCard>
            )}
            <FormSectionCard
              title="Attempt History"
              aria-label="Attempt History"
              icon={GlobalIcons.history}
              descriptionTooltip="Previous and current attempts, attendance, results and scheduled session details."
            >
              {query.currentData.attempts.length ? (
                <AssessmentAttemptHistory attempts={query.currentData.attempts} compact />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attempts recorded yet.
                </Typography>
              )}
            </FormSectionCard>
          </>
        )}
      </Stack>
    </WorkbenchDrawer>
  );
}
