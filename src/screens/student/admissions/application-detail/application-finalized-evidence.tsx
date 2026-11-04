import type { AdmissionApplicationWorkflow } from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Paper, Stack, Button, Divider, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionFeeSelectionQuery } from 'src/redux/student/admissions/admission-fee-selection-api';

import { getStageStatusColor, getStageStatusLabel } from './application-progress-model';

export function ApplicationFinalizedEvidence({
  applicationId,
  workflow,
  finalizationRecorded,
}: {
  applicationId: string;
  workflow?: AdmissionApplicationWorkflow;
  finalizationRecorded: boolean;
}) {
  // This read is authorized by the Applications.View grant already required by the workspace.
  const feeQuery = useGetAdmissionFeeSelectionQuery(applicationId, {
    refetchOnMountOrArgChange: true,
  });
  const fee =
    feeQuery.currentData?.applicationId === applicationId ? feeQuery.currentData : undefined;
  const feeConfirmed =
    fee?.onboardingConfirmed ||
    workflow?.stages.some((stage) => stage.id === fee?.ownerStageId && stage.status === 2);
  const documents =
    workflow?.stages.filter(
      (stage) => stage.documentVerificationEnabled || stage.stageType === 5
    ) ?? [];
  const documentCompleted = documents.length > 0 && documents.every((stage) => stage.status === 2);
  const documentSkipped = documents.some((stage) => stage.status === 3);
  return (
    <Paper
      component="section"
      aria-label="Admission Evidence"
      variant="outlined"
      sx={{ p: 1.5, minWidth: 0, boxShadow: 'none' }}
    >
      <Typography variant="subtitle1" component="h3">
        Admission Evidence
      </Typography>
      <Divider sx={{ my: 1.5 }} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="mdi:receipt-text-outline" width={20} />
            <Typography variant="subtitle2">Fee Structure</Typography>
          </Stack>
          {feeQuery.isLoading || (feeQuery.isFetching && !fee) ? (
            <Skeleton height={32} />
          ) : feeQuery.isError || !fee ? (
            <StudentFeedback
              notificationKey="STU-0197"
              presentation="toast"
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => feeQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Fee confirmation could not be loaded.
            </StudentFeedback>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                {fee.selection
                  ? `${fee.selection.structureName} · Revision ${fee.selection.revisionNumber}`
                  : fee.available
                    ? 'No Fee Structure Selected.'
                    : 'No Fee Confirmation Stage Configured.'}
              </Typography>
              <Label
                color={
                  fee.selection && feeConfirmed ? 'success' : fee.available ? 'warning' : 'default'
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                {fee.selection
                  ? feeConfirmed
                    ? 'Confirmed'
                    : 'Selected'
                  : fee.available
                    ? 'Not Confirmed'
                    : 'Not Configured'}
              </Label>
            </>
          )}
        </Stack>
        <Stack
          spacing={0.5}
          sx={{
            minWidth: 0,
            borderLeft: { md: 1 },
            borderTop: { xs: 1, md: 0 },
            borderColor: { xs: 'divider', md: 'divider' },
            pl: { md: 1.5 },
            pt: { xs: 1.5, md: 0 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="mdi:file-check-outline" width={20} />
            <Typography variant="subtitle2">Documents</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {documentCompleted
              ? 'Document Verification Stages Completed.'
              : documentSkipped
                ? 'Document Verification Includes a Skipped Stage.'
                : documents.length
                  ? 'Review the Saved Document Stage Outcomes.'
                  : 'No Document Verification Stage Recorded.'}
          </Typography>
          {documents.map((stage) => (
            <Stack
              key={stage.id}
              direction="row"
              spacing={0.5}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
            >
              <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
                {stage.name}
              </Typography>
              <Label color={getStageStatusColor(stage.status)}>
                {getStageStatusLabel(stage.status)}
              </Label>
            </Stack>
          ))}
        </Stack>
        <Stack
          spacing={0.5}
          sx={{
            minWidth: 0,
            borderLeft: { md: 1 },
            borderTop: { xs: 1, md: 0 },
            borderColor: { xs: 'divider', md: 'divider' },
            pl: { md: 1.5 },
            pt: { xs: 1.5, md: 0 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="mdi:account-check-outline" width={20} />
            <Typography variant="subtitle2">Guardian Contact</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {finalizationRecorded
              ? 'Verification Confirmed During Finalization.'
              : 'Finalization Verification Record Unavailable.'}
          </Typography>
          <Label
            color={finalizationRecorded ? 'success' : 'default'}
            sx={{ alignSelf: 'flex-start' }}
          >
            {finalizationRecorded ? 'Verified' : 'Not Recorded'}
          </Label>
        </Stack>
      </Box>
    </Paper>
  );
}
