import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Skeleton,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { AdmissionQueryError } from '../admission-query-error';
import { FormStageSectionList } from './form-stage-section-list';
import { FormStageReasonDialog } from './form-stage-reason-dialog';
import { useApplicationFormStage } from './hooks/use-application-form-stage';
import { useApplicationStageReadiness } from '../application-detail/application-stage-readiness';

import type { ApplicationStageReadinessHandler } from '../application-detail/application-stage-readiness';

export function ApplicationFormStage({
  applicationId,
  stage,
  canAdvance,
  advancing,
  onComplete,
  compact = false,
  showCompletionAction = true,
  onReadinessChange,
}: {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
  compact?: boolean;
  showCompletionAction?: boolean;
  onReadinessChange?: ApplicationStageReadinessHandler;
}) {
  const [verificationOpen, setVerificationOpen] = useState(false);
  const {
    action,
    setAction,
    summary,
    busy,
    query,
    verifySection,
    submitReason,
    canEdit,
    canReopen,
  } = useApplicationFormStage({ applicationId, stageId: stage.id, advancing });
  useApplicationStageReadiness(onReadinessChange, {
    stageId: stage.id,
    canComplete: Boolean(summary?.canComplete && !query.isError),
    busy: busy || Boolean(action) || (compact && verificationOpen),
    concurrencyStamp: summary?.concurrencyStamp,
  });
  const renderVerification = () =>
    summary && (
      <Stack spacing={1.5}>
        {(!compact || summary.dueAt) && (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {!compact && (
              <Chip
                size="small"
                label={`Owner: ${summary.policy?.responsibility ?? 'applicant'}`}
              />
            )}
            {!compact && (
              <Chip
                size="small"
                label={`Submissions: ${summary.submissionAttempts}/${summary.policy?.maxSubmissionAttempts ?? 1}`}
              />
            )}
            {summary.dueAt && (
              <Chip
                size="small"
                color={summary.isOverdue ? 'error' : 'default'}
                label={`Due ${new Date(summary.dueAt).toLocaleDateString()}`}
              />
            )}
          </Stack>
        )}
        {summary.blockers.length > 0 &&
          (compact && !summary.isOverdue ? (
            <Typography variant="body2" color="text.secondary" role="status">
              {summary.blockers.join(' ')}
            </Typography>
          ) : (
            <Alert severity={summary.isOverdue ? 'error' : 'info'}>
              {summary.blockers.join(' ')}
            </Alert>
          ))}
        <FormStageSectionList
          sections={summary.sections}
          disabled={busy || !summary.canVerify || !canEdit}
          onVerify={verifySection}
          onRevoke={(section) => setAction({ type: 'revoke', section })}
          compact={compact}
        />
        {canReopen && (
          <Button
            size="small"
            variant="outlined"
            sx={{ alignSelf: compact ? 'flex-end' : 'flex-start' }}
            disabled={busy || !summary.canRequestCorrection}
            onClick={() => setAction({ type: 'correction' })}
          >
            Request correction
          </Button>
        )}
      </Stack>
    );
  const reasonDialog = action && summary && (
    <FormStageReasonDialog
      title={
        action.type === 'correction'
          ? 'Request form correction'
          : `Reopen ${action.section.sectionName}`
      }
      description={
        action.type === 'correction'
          ? 'The application returns to draft. Previous section verification becomes stale and the applicant must resubmit.'
          : 'The section must be checked again before this Form stage can be completed.'
      }
      confirmLabel={action.type === 'correction' ? 'Request correction' : 'Reopen section'}
      busy={busy}
      onClose={() => setAction(null)}
      onSubmit={(reason) => submitReason(reason).then(() => undefined)}
    />
  );
  if (compact) {
    const hasVerification = summary?.sections.some((section) => section.required);
    return (
      <>
        {(!summary || hasVerification || query.isError) && (
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:clipboard-check-outline" width={16} />}
              aria-haspopup="dialog"
              disabled={busy}
              onClick={() => setVerificationOpen(true)}
            >
              Section verification
            </Button>
          </Stack>
        )}
        {summary && !hasVerification && canReopen && (
          <Button
            size="small"
            variant="outlined"
            disabled={busy || !summary.canRequestCorrection}
            onClick={() => setAction({ type: 'correction' })}
          >
            Request correction
          </Button>
        )}
        {showCompletionAction && canAdvance && summary && !query.isError && (
          <Button
            size="small"
            variant="contained"
            disabled={busy || !summary.canComplete}
            onClick={() => onComplete()}
          >
            Continue admission
          </Button>
        )}
        {verificationOpen && !action && (
          <CustomDialog
            open
            title="Section Verification"
            titleInfo="Review required sections and record staff verification after application submission."
            maxWidth="md"
            hasForm={false}
            hasUnsavedChanges={false}
            guardUnsavedChanges={false}
            disableClose={busy}
            handleClose={() => setVerificationOpen(false)}
          >
            <DialogScrollContent>
              {query.isFetching && <LinearProgress aria-label="Refreshing Form stage" />}
              {query.isLoading ? (
                <Skeleton variant="rounded" height={160} />
              ) : query.isError || !summary ? (
                <AdmissionQueryError onRetry={query.refetch} />
              ) : (
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>
                      <Typography variant="subtitle2">Required sections</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {
                          summary.sections.filter((section) => section.required && section.verified)
                            .length
                        }{' '}
                        of {summary.sections.filter((section) => section.required).length} required
                        sections verified
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {summary.submissionAttempts} of {summary.policy?.maxSubmissionAttempts ?? 1}{' '}
                        submission attempts used
                      </Typography>
                    </Box>
                    <Label color={summary.canComplete ? 'success' : 'warning'}>
                      {summary.canComplete ? 'Ready' : 'Pending'}
                    </Label>
                  </Stack>
                  {renderVerification()}
                </Stack>
              )}
            </DialogScrollContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                size="small"
                variant="outlined"
                disabled={busy}
                onClick={() => setVerificationOpen(false)}
                startIcon={<Iconify icon="mdi:close" width={16} />}
              >
                Close
              </Button>
            </DialogActions>
          </CustomDialog>
        )}
        {reasonDialog}
      </>
    );
  }
  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        {!compact && (
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <div>
              <Typography variant="h6">{stage.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Managed application form
              </Typography>
            </div>
            {summary && (
              <Label color={summary.canComplete ? 'success' : summary.isOverdue ? 'error' : 'info'}>
                {summary.canComplete ? 'Ready' : summary.isOverdue ? 'Overdue' : 'In progress'}
              </Label>
            )}
          </Stack>
        )}
        {query.isFetching && <LinearProgress aria-label="Refreshing Form stage" />}
        {query.isLoading ? (
          <Skeleton variant="rounded" height={160} />
        ) : query.isError || !summary ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : (
          <>
            {renderVerification()}
            <Stack direction="row" justifyContent={compact ? 'flex-end' : 'flex-start'} spacing={1}>
              {showCompletionAction && canAdvance && (
                <Button
                  size="small"
                  variant="contained"
                  disabled={busy || !summary.canComplete}
                  onClick={() => onComplete()}
                >
                  Continue admission
                </Button>
              )}
            </Stack>
          </>
        )}
        {reasonDialog}
      </Stack>
    </Card>
  );
}
