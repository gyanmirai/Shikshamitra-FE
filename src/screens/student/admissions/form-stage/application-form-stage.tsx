import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Skeleton,
  Accordion,
  Typography,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
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
    busy: busy || Boolean(action),
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
  return (
    <Card
      sx={{
        p: compact ? 1.5 : 2,
        ...(compact && { boxShadow: 'none', border: 1, borderColor: 'divider' }),
      }}
    >
      <Stack spacing={compact ? 1.5 : 2}>
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
            {compact ? (
              <Accordion
                key={`${stage.id}:${summary.formStatus === 1 ? 'submitted' : 'draft'}`}
                defaultExpanded={summary.formStatus === 1}
                disabled={busy}
                disableGutters
                sx={{
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  border: 0,
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}
                  sx={{ px: 0, minHeight: 44, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    flexWrap="wrap"
                    sx={{ width: 1 }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2">Section verification</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {summary.formStatus === 1
                          ? `${summary.sections.filter((section) => section.required && section.verified).length} of ${summary.sections.filter((section) => section.required).length} required sections verified`
                          : 'Submit the application before staff verification.'}
                        {' · '}
                        {summary.submissionAttempts} of {summary.policy?.maxSubmissionAttempts ?? 1}{' '}
                        submission attempts used
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, pt: 1 }}>{renderVerification()}</AccordionDetails>
              </Accordion>
            ) : (
              renderVerification()
            )}
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
        {action && summary && (
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
        )}
      </Stack>
    </Card>
  );
}
