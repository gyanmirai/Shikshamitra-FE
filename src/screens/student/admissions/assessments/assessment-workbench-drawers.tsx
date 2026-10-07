import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';
import type {
  AssessmentRoster,
  AssessmentRosterItem,
} from 'src/redux/student/admissions/admission-assessment-roster-api';

import { useId } from 'react';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Scrollbar } from 'src/components/scrollbar';
import { studentPaths } from 'src/constants/student-menu';
import { useGetApplicationAssessmentQuery } from 'src/redux/student/admissions/admission-assessments-api';
import {
  Box,
  Stack,
  Alert,
  Drawer,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import { AdmissionQueryError } from '../admission-query-error';
import { assessmentQueues } from './assessment-workbench-model';
import { AssessmentAttemptHistory } from './assessment-attempt-history';

function WorkbenchDrawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
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
        sx: { width: { xs: 1, sm: 560 }, maxWidth: 1 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <Typography id={titleId} variant="h6">
          {title}
        </Typography>
        <IconButton size="small" aria-label={`Close ${title}`} onClick={onClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Scrollbar sx={{ minHeight: 0 }}>
        <Box sx={{ p: 2 }}>{children}</Box>
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
  scope: AssessmentScope;
  sessionName?: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <WorkbenchDrawer title="Assessment insights" onClose={onClose}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {scope.offeringName} · {scope.stageName}
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
  returnUrl,
  onClose,
}: {
  row: AssessmentRosterItem;
  canViewApplication: boolean;
  returnUrl: string;
  onClose: () => void;
}) {
  const query = useGetApplicationAssessmentQuery(
    { applicationId: row.applicationId, stageInstanceId: row.stageInstanceId },
    { refetchOnMountOrArgChange: true }
  );
  return (
    <WorkbenchDrawer title="Assessment details" onClose={onClose}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1">{row.applicantName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {row.applicationNumber} · {row.stageName}
          </Typography>
        </Box>
        {canViewApplication && (
          <Button
            size="small"
            variant="outlined"
            component={RouterLink}
            href={`${studentPaths.enrollment.applications}/${row.applicationId}?returnTo=${encodeURIComponent(returnUrl)}`}
            startIcon={<Iconify icon="mdi:open-in-new" />}
          >
            Open application
          </Button>
        )}
        {query.isError ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : !query.currentData ? (
          <Skeleton variant="rounded" height={150} />
        ) : (
          <>
            {!!query.currentData.blockers.length && (
              <Alert severity="info">{query.currentData.blockers.join(' ')}</Alert>
            )}
            <Typography variant="subtitle2">Attempt history</Typography>
            {query.currentData.attempts.length ? (
              <AssessmentAttemptHistory attempts={query.currentData.attempts} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No attempts recorded yet.
              </Typography>
            )}
          </>
        )}
      </Stack>
    </WorkbenchDrawer>
  );
}
