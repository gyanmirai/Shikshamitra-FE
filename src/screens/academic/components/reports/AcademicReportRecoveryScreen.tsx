'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { skipToken } from '@reduxjs/toolkit/query';
import { useRef, useState, useCallback } from 'react';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { academicReportPaths } from 'src/constants/academic-report-paths';
import { Card, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { academicReportApi, useRegenerateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';

const pendingStatuses = new Set(['Queued', 'Running']);
const reportStatuses: Record<string, string> = {
  Queued: 'Queued',
  Running: 'Generating',
  Completed: 'Report ready',
  Expired: 'Report expired',
  Unavailable: 'Report file unavailable',
  Failed: 'Generation failed',
  Cancelled: 'Generation cancelled',
};

export function AcademicReportRecoveryScreen({ jobId }: { jobId: string }) {
  const { sessionContext, user } = useSelector((state: RootState) => state.auth);
  const owner = sessionContext?.tenantId && user?.sub ? `${sessionContext.tenantId}:${user.sub}` : '';
  return <ReportRecovery key={`${owner}/${jobId}`} jobId={jobId} owner={owner} />;
}

function ReportRecovery({ jobId, owner }: { jobId: string; owner: string }) {
  const argument = owner ? { jobId, owner } : skipToken;
  const endpoint = academicReportApi.endpoints.getAcademicReportRecovery;
  const { currentData: report } = endpoint.useQueryState(argument);
  const pending = Boolean(report && pendingStatuses.has(report.status));
  const query = endpoint.useQuery(argument, {
    pollingInterval: pending ? 3000 : 0,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const [regenerate, { isLoading }] = useRegenerateAcademicReportExportMutation();
  const [problem, setProblem] = useState('');
  const requesting = useRef(false);

  const { refetch } = query;
  const canRegenerate = report?.canRegenerate;
  const requestReplacement = useCallback(async () => {
    if (requesting.current || !canRegenerate) return;
    requesting.current = true;
    setProblem('');
    try {
      await regenerate({ jobId, owner }).unwrap();
    } catch {
      setProblem('The report could not be queued. Check the status and try again.');
    }
    try { await refetch(); }
    finally { requesting.current = false; }
  }, [canRegenerate, jobId, owner, refetch, regenerate]);

  const fileExpired = report?.status === 'Expired' || report?.status === 'Unavailable';
  const reportName = report?.reportType.replace(/^(\S+)$/, (token) => token.replace(/([a-z0-9])([A-Z])/g, '$1 $2'));
  return (
    <Stack spacing={2}>
      <CustomBreadcrumbs heading="Report Export" headingComponent="h1" links={[
        { name: 'Academics', href: academicPaths.dashboard },
        { name: 'Report Export' },
      ]} />
      {query.isError ? (
        <Alert severity="error" action={<Button size="small" onClick={() => query.refetch()}>Retry</Button>}>
          This report could not be opened. Sign in with the account that requested it.
        </Alert>
      ) : !report ? (
        <Skeleton variant="rounded" height={132} aria-label="Loading report status" />
      ) : (
        <Card variant="outlined" sx={{ maxWidth: 640 }}>
          {(pending || isLoading) && <LinearProgress aria-label="Generating report" />}
          <Stack spacing={2} sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" component="h2" sx={{ overflowWrap: 'anywhere' }}>{reportName}</Typography>
              <Typography variant="body2" color="text.secondary" role="status">
                {reportStatuses[report.status] ?? report.status}{report.format ? ` · ${report.format.toUpperCase()}` : ''}
              </Typography>
            </Stack>
            {report.canRegenerate && (
              <Typography variant="body2" color="text.secondary">
                Generate the report again with its saved filters and your current access.
              </Typography>
            )}
            {fileExpired && !report.canRegenerate && (
              <Alert severity="warning">Your account does not have permission to generate this report again.</Alert>
            )}
            {pending && (
              <Typography variant="body2" color="text.secondary">
                You can leave this page while the report is being generated.
              </Typography>
            )}
            {problem && !pending && report.status !== 'Completed' && <Alert severity="error">{problem}</Alert>}
            {report.canRegenerate && (
              <Button size="small" variant="contained" sx={{ alignSelf: 'flex-start' }} loading={isLoading} disabled={query.isFetching}
                onClick={requestReplacement}>Generate again</Button>
            )}
            {report.status === 'Completed' && (
              <Button size="small" variant="contained" component="a" href={academicReportPaths.download(jobId)}
                sx={{ alignSelf: 'flex-start' }} startIcon={<Iconify icon={GlobalIcons.download} />}>Download report</Button>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
