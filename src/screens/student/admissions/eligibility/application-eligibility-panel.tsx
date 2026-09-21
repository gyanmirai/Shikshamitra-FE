import type { EligibilitySummary } from 'src/redux/student/admissions/admission-eligibility-types';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Card, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { useGetApplicationEligibilityQuery } from 'src/redux/student/admissions/admission-eligibility-api';

import { AdmissionQueryError } from '../admission-query-error';
import { useEligibilityActions } from './use-eligibility-actions';
import { EligibilityActionDialog } from './eligibility-action-dialog';
import { EligibilityResultContent } from './eligibility-result-content';
import { useEligibilityPermissions } from './use-eligibility-permissions';

import type { EligibilityAction } from './eligibility-action-model';

export function ApplicationEligibilityPanel({
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
  const permissions = useEligibilityPermissions();
  const query = useGetApplicationEligibilityQuery(
    { applicationId, stageId: stage.id },
    { skip: !permissions.view }
  );
  const run = useEligibilityActions();
  // Capture the evaluation and application stamp at the moment staff choose an action.
  const [selected, setSelected] = useState<{
    summary: EligibilitySummary;
    action: EligibilityAction;
    exceptionId?: string;
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
            Eligibility access is required to view these results. Contact an admissions
            administrator.
          </Alert>
        ) : query.isLoading ? (
          <Skeleton variant="rounded" height={180} />
        ) : query.isError || !summary ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : !summary.eligibilityEnabled ? (
          <Alert severity="info">
            Eligibility checks are not enabled for this step. Refresh the application to load its
            current workflow.
          </Alert>
        ) : (
          <>
            {query.isFetching && <LinearProgress aria-label="Refreshing eligibility results" />}
            <EligibilityResultContent
              summary={summary}
              permissions={permissions}
              disabled={query.isFetching || advancing}
              onAction={(action, exceptionId) => setSelected({ summary, action, exceptionId })}
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
          <EligibilityActionDialog
            action={selected.action}
            summary={selected.summary}
            exceptionId={selected.exceptionId}
            onSubmit={(reason) =>
              run(selected.summary, selected.action, reason, selected.exceptionId)
            }
            onClose={() => setSelected(null)}
          />
        )}
      </Stack>
    </Card>
  );
}
