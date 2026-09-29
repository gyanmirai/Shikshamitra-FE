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

import type { DocumentAction } from './document-action-model';

export function ApplicationDocumentsPanel({
  applicationId,
  stage,
  canAdvance = false,
  advancing = false,
  onComplete,
  historical = false,
  disabled = false,
}: {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance?: boolean;
  advancing?: boolean;
  onComplete?: () => void;
  historical?: boolean;
  disabled?: boolean;
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
              summary={summary}
              permissions={permissions}
              disabled={disabled || query.isFetching || advancing}
              readOnly={historical || !(summary.isActive || summary.canCollectDuringForm)}
              onAction={(action, requirement) => setSelected({ action, requirement, summary })}
            />
            {!historical && summary.isActive && canAdvance && (
              <Stack direction="row">
                <Button
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
