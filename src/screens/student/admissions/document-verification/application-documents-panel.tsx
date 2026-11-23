import type { RootState } from 'src/redux/store';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';
import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { visuallyHidden } from '@mui/utils';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { skeletonReducedMotionSx } from 'src/theme/styles/skeleton';
import { Box, Card, Stack, Button, Skeleton, Typography } from '@mui/material';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useGetApplicationDocumentsQuery } from 'src/redux/student/admissions/admission-document-verification-api';

import { AdmissionQueryError } from '../admission-query-error';
import { DocumentActionDialog } from './document-action-dialog';
import { DocumentReviewDialog } from './document-review-dialog';
import { getDocumentReviewActions } from './document-review-model';
import { useDocumentPermissions } from './use-document-permissions';
import { DocumentChecklistContent } from './document-checklist-content';
import { DocumentRequirementTable } from './document-requirement-table';
import { useApplicationStageReadiness } from '../application-detail/application-stage-readiness';
import { ParentRegistrationPanel } from '../application-detail/parent-registration/parent-registration-panel';

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
  const [parentMutationBusy, setParentMutationBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const grants = useSelector((state: RootState) => state.auth.permissions);
  const canManageParentRegistration =
    hasGrantedPermission(grants, 'Students.Admissions.Applications.View') &&
    hasGrantedPermission(grants, 'Students.Admissions.Applications.Edit');
  const query = useGetApplicationDocumentsQuery(
    { applicationId, stageInstanceId: stage.id },
    { skip: !permissions.view }
  );
  const [selected, setSelected] = useState<{
    action: DocumentAction | 'view';
    requirement: AdmissionDocumentRequirement;
    summary: ApplicationDocumentVerification;
    readOnly?: boolean;
  } | null>(null);
  const summary = query.currentData;
  const initialLoading = !summary && (query.isLoading || query.isFetching);
  const refreshChecklist = async () => {
    if (refreshing || query.isFetching || advancing) return;
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  };
  const readOnly =
    historical ||
    !(
      summary?.isActive ||
      summary?.canCollectDuringForm ||
      summary?.requirements.some(
        (requirement) =>
          requirement.canUpload ||
          requirement.canRecordOriginal ||
          requirement.canReview ||
          requirement.canWaive
      )
    );
  useApplicationStageReadiness(onReadinessChange, {
    stageId: stage.id,
    canComplete: Boolean(!historical && permissions.view && summary?.canComplete && !query.isError),
    busy: disabled || query.isFetching || advancing || Boolean(selected) || parentMutationBusy,
    concurrencyStamp: summary?.concurrencyStamp,
  });
  return (
    <Card
      aria-busy={query.isFetching}
      sx={{
        ...skeletonReducedMotionSx,
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
          <Stack direction="row" alignItems="center" sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
              {stage.name}
            </Typography>
            <InfoTooltipIcon
              label="Document verification help"
              title={
                <Stack spacing={1}>
                  <Typography variant="body2">
                    {layout === 'table'
                      ? 'Upload documents from the table, then open a preview to approve or reject. Rejection requires a reason. History and Download are in More.'
                      : 'Collect and review the required documents. Rejection requires a reason. Open document history to review previous versions and decisions.'}
                  </Typography>
                  {summary?.policy?.requireIndependentReview && (
                    <Typography variant="body2">
                      A different authorized reviewer must check collected evidence.
                    </Typography>
                  )}
                  {summary?.blockers.map((blocker) => (
                    <Typography key={blocker} variant="body2">
                      {blocker}
                    </Typography>
                  ))}
                  {summary?.canComplete && summary.blockers.length > 0 && (
                    <Typography variant="body2">
                      Your workflow allows continuation. Complete pending documents in Student
                      Onboarding before activation.
                    </Typography>
                  )}
                </Stack>
              }
            />
          </Stack>
          {permissions.view && (
            <Button
              size="small"
              disabled={query.isFetching || advancing}
              loading={refreshing}
              loadingPosition="start"
              startIcon={<Iconify icon={GlobalIcons.refresh} />}
              onClick={refreshChecklist}
            >
              Refresh
            </Button>
          )}
        </Stack>
        {!permissions.view ? (
          <StudentFeedback notificationKey="STU-0303" presentation="inline" severity="info">
            Document access is required to view this checklist. Contact an admissions administrator.
          </StudentFeedback>
        ) : initialLoading ? (
          layout === 'table' ? (
            <>
              <Box role="status" aria-label="Loading Document Checklist" sx={visuallyHidden}>
                Loading document checklist…
              </Box>
              <DocumentRequirementTable
                applicationId={applicationId}
                stageInstanceId={stage.id}
                permissions={permissions}
                isLoading
              />
            </>
          ) : (
            <Stack role="status" aria-label="Loading Document Checklist" spacing={1}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rounded" height={140} />
            </Stack>
          )
        ) : query.isError || !summary ? (
          <AdmissionQueryError onRetry={refreshChecklist} />
        ) : !summary.documentVerificationEnabled || !summary.policy ? (
          <StudentFeedback notificationKey="STU-0304" presentation="inline" severity="info">
            Document management is not enabled for this step. Refresh the application to load its
            current workflow.
          </StudentFeedback>
        ) : (
          <>
            {!historical && canManageParentRegistration && (
              <ParentRegistrationPanel
                applicationId={applicationId}
                documentStageId={stage.id}
                canView={permissions.view}
                canManage={canManageParentRegistration}
                disabled={disabled || query.isFetching || advancing || Boolean(selected)}
                currentValues={{}}
                onBusyChange={setParentMutationBusy}
              />
            )}
            <DocumentChecklistContent
              layout={layout}
              summary={summary}
              permissions={permissions}
              disabled={disabled || query.isFetching || advancing || parentMutationBusy}
              readOnly={readOnly}
              onAction={(action, requirement) => setSelected({ action, requirement, summary })}
              onView={(requirement) =>
                setSelected({ action: 'view', requirement, summary, readOnly })
              }
            />
            {showCompletionAction && !historical && summary.isActive && canAdvance && (
              <Stack direction="row">
                <Button
                  size="small"
                  variant="contained"
                  disabled={
                    !summary.canComplete ||
                    query.isFetching ||
                    advancing ||
                    Boolean(selected) ||
                    parentMutationBusy
                  }
                  onClick={() => onComplete?.()}
                >
                  {advancing ? 'Continuing…' : 'Continue Admission'}
                </Button>
              </Stack>
            )}
          </>
        )}
        {selected &&
          permissions.view &&
          (selected.action === 'view' ? (
            <DocumentReviewDialog
              summary={selected.summary}
              requirement={selected.requirement}
              readOnly={historical || selected.readOnly === true}
              disabled={disabled || query.isFetching || advancing}
              permissions={permissions}
              onClose={() => setSelected(null)}
            />
          ) : (
            <DocumentActionDialog
              action={selected.action}
              summary={selected.summary}
              requirement={selected.requirement}
              canSubmit={
                !disabled &&
                !query.isFetching &&
                !advancing &&
                getDocumentReviewActions(
                  selected.requirement,
                  permissions,
                  historical || selected.readOnly === true,
                  selected.summary.policy?.allowWaivers === true
                ).includes(selected.action)
              }
              onClose={() => setSelected(null)}
            />
          ))}
      </Stack>
    </Card>
  );
}
