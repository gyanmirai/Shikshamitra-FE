'use client';

import { useState } from 'react';
import { DoneAll, FactCheck, Refresh } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Box, Chip, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import {
  AdmissionCrmDataQualityIssueSeverity,
  AdmissionCrmDataQualityIssueStatus,
  AdmissionCrmDataQualityIssueType,
  useAcknowledgeAdmissionCrmDataQualityIssueMutation,
  useGetAdmissionCrmDataQualityIssuesQuery,
  useResolveAdmissionCrmDataQualityIssueMutation,
  useRunAdmissionCrmReconciliationMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

const severityColor = (severity: AdmissionCrmDataQualityIssueSeverity) =>
  severity === AdmissionCrmDataQualityIssueSeverity.Critical
    ? 'error'
    : severity === AdmissionCrmDataQualityIssueSeverity.Error
      ? 'warning'
      : 'default';

export function AdmissionsDataQuality({ academicYearId }: { academicYearId: string }) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [resolutionReason, setResolutionReason] = useState('');
  const issues = useGetAdmissionCrmDataQualityIssuesQuery(
    { academicYearId, maxResultCount: 50 },
    { skip: !academicYearId }
  );
  const [runReconciliation, runState] = useRunAdmissionCrmReconciliationMutation();
  const [acknowledge, acknowledgeState] = useAcknowledgeAdmissionCrmDataQualityIssueMutation();
  const [resolve, resolveState] = useResolveAdmissionCrmDataQualityIssueMutation();
  const active = (issues.data?.items || []).filter(
    (issue) => issue.status < AdmissionCrmDataQualityIssueStatus.Resolved
  );

  const run = async () => {
    try {
      const result = await runReconciliation({ academicYearId }).unwrap();
      shikshaMitraToast.success({
        message: `Reconciliation completed: ${result.detectedCount} detected, ${result.newCount} new, ${result.autoResolvedCount} resolved.`,
      });
    } catch {
      shikshaMitraToast.error({ message: 'Reconciliation could not be completed.' });
    }
  };

  const resolveSelected = async (ignore: boolean) => {
    if (!selectedIssueId || !resolutionReason.trim()) return;
    try {
      await resolve({ issueId: selectedIssueId, ignore, reason: resolutionReason.trim() }).unwrap();
      setSelectedIssueId(null);
      setResolutionReason('');
      shikshaMitraToast.success({
        message: ignore ? 'Issue disposition recorded.' : 'Issue marked resolved.',
      });
    } catch {
      shikshaMitraToast.error({ message: 'The issue could not be updated.' });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="subtitle2">Enrollment data quality</Typography>
            <Typography variant="caption" color="text.secondary">
              {active.length} unresolved cross-stage issue(s)
            </Typography>
          </Box>
          <LoadingButton
            size="small"
            variant="outlined"
            startIcon={<Refresh />}
            loading={runState.isLoading}
            onClick={run}
          >
            Run reconciliation
          </LoadingButton>
        </Stack>
        {issues.isFetching && <Alert severity="info">Loading governed data-quality issues.</Alert>}
        {!issues.isFetching && active.length === 0 && (
          <Alert severity="success">No unresolved data-quality issues were detected.</Alert>
        )}
        <Stack divider={<Divider flexItem />}>
          {active.map((issue) => (
            <Stack key={issue.id} spacing={0.75} sx={{ py: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {issue.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {AdmissionCrmDataQualityIssueType[issue.issueType]} - last detected{' '}
                    {new Date(issue.lastDetectedAt).toLocaleString()}
                  </Typography>
                </Box>
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                  <Chip
                    size="small"
                    color={severityColor(issue.severity)}
                    label={AdmissionCrmDataQualityIssueSeverity[issue.severity]}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={AdmissionCrmDataQualityIssueStatus[issue.status]}
                  />
                </Stack>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Impacts: {issue.impactedReports.join(', ') || 'Operational reporting'}
              </Typography>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                {issue.status === AdmissionCrmDataQualityIssueStatus.Open && (
                  <LoadingButton
                    size="small"
                    startIcon={<FactCheck />}
                    loading={acknowledgeState.isLoading}
                    onClick={() => acknowledge({ issueId: issue.id }).unwrap()}
                  >
                    Acknowledge
                  </LoadingButton>
                )}
                <LoadingButton
                  size="small"
                  startIcon={<DoneAll />}
                  onClick={() => setSelectedIssueId(issue.id)}
                >
                  Record resolution
                </LoadingButton>
              </Stack>
              {selectedIssueId === issue.id && (
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={0.75}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Resolution or accepted-risk reason"
                    value={resolutionReason}
                    onChange={(event) => setResolutionReason(event.target.value)}
                  />
                  <LoadingButton
                    variant="contained"
                    loading={resolveState.isLoading}
                    disabled={!resolutionReason.trim()}
                    onClick={() => resolveSelected(false)}
                  >
                    Resolve
                  </LoadingButton>
                  <LoadingButton
                    color="warning"
                    loading={resolveState.isLoading}
                    disabled={!resolutionReason.trim()}
                    onClick={() => resolveSelected(true)}
                  >
                    Accept risk
                  </LoadingButton>
                </Stack>
              )}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
