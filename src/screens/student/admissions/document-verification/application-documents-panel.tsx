import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';
import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { Card, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { useGetApplicationDocumentsQuery } from 'src/redux/student/admissions/admission-document-verification-api';

import { AdmissionQueryError } from '../admission-query-error';
import { DocumentActionDialog } from './document-action-dialog';
import { useDocumentPermissions } from './use-document-permissions';
import { DocumentChecklistContent } from './document-checklist-content';
import { useApplicationStageReadiness } from '../application-detail/application-stage-readiness';

import type { DocumentAction } from './document-action-model';
import type { ApplicationStageReadinessHandler } from '../application-detail/application-stage-readiness';

export function ApplicationDocumentsPanel({
  applicationId,
  stage,
  canAdvance = false,
  advancing = false,
  onComplete,
  historical = false,
  disabled = false,
  layout = 'cards',
  showCompletionAction = true,
  onReadinessChange,
}: {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance?: boolean;
  advancing?: boolean;
  onComplete?: () => void;
  historical?: boolean;
  disabled?: boolean;
  layout?: 'cards' | 'table';
  showCompletionAction?: boolean;
  onReadinessChange?: ApplicationStageReadinessHandler;
}) {
  const permissions = useDocumentPermissions();
  const query = useGetApplicationDocumentsQuery(
    { applicationId, stageInstanceId: stage.id },
    { skip: !permissions.view }
  );
  const [selected, setSelected] = useState<{
    action: DocumentAction;
    requirement: AdmissionDocumentRequirement;
    summary: ApplicationDocumentVerification;
  } | null>(null);
  const summary = query.currentData;
  useApplicationStageReadiness(onReadinessChange, {
    stageId: stage.id,
    canComplete: Boolean(!historical && permissions.view && summary?.canComplete && !query.isError),
    busy: disabled || query.isFetching || advancing || Boolean(selected),
    concurrencyStamp: summary?.concurrencyStamp,
  });
  return (
    <Card
      sx={{
        p: historical ? 0 : 2,
        boxShadow: historical ? 'none' : undefined,
        ...(layout === 'table' && {
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }),
      }}
    >
      <Stack
        spacing={2}
        sx={layout === 'table' ? { flex: 1, minWidth: 0, minHeight: 0 } : undefined}
      >
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
            Document access is required to view this checklist. Contact an admissions administrator.
          </Alert>
        ) : query.isLoading ? (
          <Skeleton variant="rounded" height={180} />
        ) : query.isError || !summary ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : !summary.documentVerificationEnabled || !summary.policy ? (
          <Alert severity="info">
            Document management is not enabled for this step. Refresh the application to load its
            current workflow.
          </Alert>
        ) : (
          <>
            {query.isFetching && <LinearProgress aria-label="Refreshing document checklist" />}
            <DocumentChecklistContent
              layout={layout}
              summary={summary}
              permissions={permissions}
              disabled={disabled || query.isFetching || advancing}
              readOnly={
                historical ||
                !(
                  summary.isActive ||
                  summary.canCollectDuringForm ||
                  summary.requirements.some(
                    (requirement) =>
                      requirement.canUpload ||
                      requirement.canRecordOriginal ||
                      requirement.canReview ||
                      requirement.canWaive
                  )
                )
              }
              onAction={(action, requirement) => setSelected({ action, requirement, summary })}
            />
            {showCompletionAction && !historical && summary.isActive && canAdvance && (
              <Stack direction="row">
                <Button
                  size="small"
                  variant="contained"
                  disabled={!summary.canComplete || query.isFetching || advancing}
                  onClick={() => onComplete?.()}
                >
                  {advancing ? 'Continuing…' : 'Continue admission'}
                </Button>
              </Stack>
            )}
          </>
        )}
        {selected && permissions.view && (
          <DocumentActionDialog {...selected} onClose={() => setSelected(null)} />
        )}
      </Stack>
    </Card>
  );
}
