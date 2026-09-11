import type { ReviewSummary } from 'src/redux/student/admissions/admission-review-types';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Card, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { useGetApplicationReviewQuery } from 'src/redux/student/admissions/admission-review-api';

import { ReviewEditorDialog } from './review-editor-dialog';
import { AdmissionQueryError } from '../admission-query-error';
import { useReviewPermissions } from './use-review-permissions';
import { ReviewSummaryContent } from './review-summary-content';
import { ReviewAssignmentDialog } from './review-assignment-dialog';
import { ReviewCorrectionDialog } from './review-correction-dialog';

import type { ReviewAction } from './review-summary-content';

export function ApplicationReviewPanel({
  applicationId,
  stage,
  canAdvance = false,
  advancing = false,
  onComplete,
  historical = false,
}: {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance?: boolean;
  advancing?: boolean;
  onComplete?: () => void;
  historical?: boolean;
}) {
  const permissions = useReviewPermissions();
  const query = useGetApplicationReviewQuery(
    { applicationId, stageId: stage.id },
    { skip: !permissions.view }
  );
  const [selected, setSelected] = useState<{ summary: ReviewSummary; action: ReviewAction } | null>(
    null
  );
  const summary = query.currentData;
  return (
    <Card sx={{ p: historical ? 0 : 2, boxShadow: historical ? 'none' : undefined }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="h6">{stage.name}</Typography>
          {permissions.view && (
            <Button size="small" disabled={query.isFetching || advancing} onClick={query.refetch}>
              Refresh
            </Button>
          )}
        </Stack>
        {!permissions.view ? (
          <Alert severity="info">
            Review access is required to view the checklist and recommendations. Contact an
            admissions administrator.
          </Alert>
        ) : query.isLoading ? (
          <Skeleton variant="rounded" height={180} />
        ) : query.isError || !summary ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : !summary.reviewEnabled ? (
          <Alert severity="info">
            Managed review is not enabled for this step. Refresh the application to load its current
            workflow.
          </Alert>
        ) : (
          <>
            {query.isFetching && <LinearProgress aria-label="Refreshing review" />}
            <ReviewSummaryContent
              summary={summary}
              disabled={query.isFetching || advancing}
              onAction={(action) => setSelected({ summary, action })}
            />
            {!historical && summary.isActive && canAdvance && (
              <Stack direction="row">
                <Button
                  variant="contained"
                  disabled={!summary.canComplete || query.isFetching || advancing}
                  onClick={onComplete}
                >
                  {advancing ? 'Continuing…' : 'Continue admission'}
                </Button>
              </Stack>
            )}
          </>
        )}
        {selected?.action === 'edit' && permissions.view && (
          <ReviewEditorDialog
            summary={selected.summary}
            onClose={() => setSelected(null)}
            onReload={() => query.refetch().unwrap()}
          />
        )}
        {selected?.action === 'assign' && permissions.assign && (
          <ReviewAssignmentDialog
            summary={selected.summary}
            onClose={() => setSelected(null)}
            onReload={() => query.refetch().unwrap()}
          />
        )}
        {selected?.action === 'correct' && permissions.decide && permissions.reopen && (
          <ReviewCorrectionDialog
            summary={selected.summary}
            onClose={() => setSelected(null)}
            onReload={() => query.refetch().unwrap()}
          />
        )}
      </Stack>
    </Card>
  );
}
