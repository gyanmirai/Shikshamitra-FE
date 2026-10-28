'use client';

import type { RootState } from 'src/redux/store';

import { api } from 'src/redux/service';
import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useDispatch, useSelector } from 'react-redux';
import { financeModuleType } from 'src/redux/tagTypes';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Stack, Button, Skeleton, IconButton, Typography } from '@mui/material';
import {
  useGetAdmissionFeeSelectionQuery,
  useConfirmAdmissionFeeSelectionOnboardingMutation,
} from 'src/redux/student/admissions/admission-fee-selection-api';

import AdmissionFeeCollectionPanel from './admission-fee-collection-panel';
import { AdmissionFeeSelectionEditor } from './admission-fee-selection-editor';
import { getAdmissionFeeCollectionAccess } from './admission-fee-collection-permissions';
import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';
import { useApplicationStageReadiness } from '../application-detail/application-stage-readiness';
import { AdmissionFeeHeads, AdmissionFeeSelectionSummary } from './admission-fee-selection-summary';

import type { AdmissionFeeSelectionEditorState } from './admission-fee-selection-editor';
import type { ApplicationStageReadinessHandler } from '../application-detail/application-stage-readiness';

type Props = {
  applicationId: string;
  mode?: 'admissions' | 'onboarding';
  canConfirm?: boolean;
  outlined?: boolean;
  canContinue?: boolean;
  completionStageId?: string;
  continuing?: boolean;
  onContinue?: () => void;
  onCollectLater?: () => void;
  onCollectionOpenChange?: (open: boolean) => void;
  editorBlocked?: boolean;
  onEditorStateChange?: (state: AdmissionFeeSelectionEditorState) => void;
  compact?: boolean;
  readOnly?: boolean;
  onReadinessChange?: ApplicationStageReadinessHandler;
};
const readPermissions = [
  'Students.Admissions.Applicants.View',
  ADMISSION_APPLICATION_PERMISSIONS.view,
  'Students.Onboarding.View',
];

export function useFeeSelectionEditorState(
  onStateChange?: (state: AdmissionFeeSelectionEditorState) => void
) {
  const [state, setState] = useState<AdmissionFeeSelectionEditorState>({
    dirty: false,
    busy: false,
  });
  const update = useCallback(
    (next: AdmissionFeeSelectionEditorState) => {
      setState(next);
      onStateChange?.(next);
    },
    [onStateChange]
  );
  return { state, update, blocked: state.dirty || state.busy };
}

export default function AdmissionFeeSelectionPanel({
  applicationId,
  mode = 'admissions',
  canConfirm = true,
  outlined = false,
  canContinue = false,
  completionStageId,
  continuing = false,
  onContinue,
  onCollectLater,
  onCollectionOpenChange,
  editorBlocked = false,
  onEditorStateChange,
  compact = false,
  readOnly = false,
  onReadinessChange,
}: Props) {
  const dispatch = useDispatch();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const workspaceLayout = compact && mode === 'admissions';
  const canRead = hasGrantedPermission(permissions, readPermissions);
  const query = useGetAdmissionFeeSelectionQuery(applicationId, {
    skip: !applicationId || !canRead,
  });
  const [editing, setEditing] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const collectionOpenChanged = useCallback(
    (open: boolean) => {
      setCollectionOpen(open);
      onCollectionOpenChange?.(open);
    },
    [onCollectionOpenChange]
  );
  const [confirm, confirmState] = useConfirmAdmissionFeeSelectionOnboardingMutation();
  const [confirmationError, setConfirmationError] = useState<string>();
  const state = query.currentData;
  useApplicationStageReadiness(onReadinessChange, {
    stageId: completionStageId ?? '',
    canComplete: Boolean(
      canRead &&
      !readOnly &&
      !editing &&
      state?.selection &&
      (mode !== 'admissions' || state.paymentCompletion?.canComplete === true) &&
      !collectionOpen &&
      !query.isError &&
      (!completionStageId || state.currentStageId === completionStageId)
    ),
    // The inline editor must stay interactive; editing blocks completion, not the workspace.
    busy: query.isFetching || continuing,
    concurrencyStamp: state?.concurrencyStamp,
  });

  if (!canRead || !applicationId) return null;
  if (query.isLoading || (!state && query.isFetching))
    return mode === 'onboarding' ? (
      <Stack role="status" aria-label="Loading fee structure" spacing={0.5}>
        <Skeleton variant="text" width={148} height={28} />
        <Skeleton variant="text" width="60%" height={22} />
        <Skeleton variant="text" width="42%" height={18} />
        <Skeleton variant="rounded" height={44} sx={{ mt: 1 }} />
      </Stack>
    ) : workspaceLayout ? (
      <Stack role="status" aria-label="Loading fee structure" spacing={1.5} sx={{ flex: 1 }}>
        <Typography variant="subtitle1">Payment</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
            flex: 1,
          }}
        >
          {[0, 1].map((key) => (
            <Stack
              key={key}
              spacing={1.5}
              sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
            >
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rounded" height={80} />
            </Stack>
          ))}
        </Box>
      </Stack>
    ) : (
      <Box aria-label="Loading fee structure">
        <Skeleton height={90} />
      </Box>
    );
  if (!state)
    return (
      <Stack spacing={1.5} sx={{ flex: workspaceLayout ? 1 : undefined }}>
        {workspaceLayout && <Typography variant="subtitle1">Payment</Typography>}
        <StudentFeedback
          notificationKey="STU-0349"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Fee structure details could not be loaded.
        </StudentFeedback>
      </Stack>
    );
  if ((mode === 'onboarding' && !state.selection) || (!state.available && !state.selection))
    return null;

  const canEdit =
    !readOnly &&
    mode === 'admissions' &&
    state.canEdit &&
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const canConfirmSelection =
    !readOnly &&
    mode === 'onboarding' &&
    canConfirm &&
    state.canConfirmOnboarding &&
    hasGrantedPermission(permissions, 'Students.Onboarding.Add');
  const { selection } = state;
  const showEditor = canEdit && editing;
  const showCollection =
    mode === 'admissions' && !readOnly && getAdmissionFeeCollectionAccess(permissions).canView;
  const selectionAction = canEdit && !showEditor && (
    <Button
      size="small"
      variant={!selection ? 'contained' : 'outlined'}
      startIcon={<Iconify icon="mdi:file-document-outline" width={16} />}
      disabled={query.isFetching || query.isError || continuing || collectionOpen}
      onClick={() => setEditing(true)}
    >
      {selection ? 'Change fee structure' : 'Select fee structure'}
    </Button>
  );
  const deferralAction = onCollectLater &&
    mode === 'admissions' &&
    !readOnly &&
    state.paymentCompletion?.canDeferCollection === true && (
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="mdi:clock-outline" width={16} />}
        disabled={
          query.isFetching || query.isError || continuing || editorBlocked || collectionOpen
        }
        onClick={onCollectLater}
        sx={{ flexShrink: 0 }}
      >
        Collect later in Onboarding
      </Button>
    );

  return (
    <Box
      component="section"
      aria-label={workspaceLayout ? 'Payment' : 'Fee structure'}
      sx={{
        minWidth: 0,
        ...(workspaceLayout && { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }),
        ...(outlined &&
          !compact && { p: 2.5, mb: 2, border: 1, borderColor: 'divider', borderRadius: 2 }),
      }}
    >
      <Stack
        spacing={compact ? 1 : 1.5}
        useFlexGap
        sx={{ flex: workspaceLayout ? 1 : undefined, minHeight: 0 }}
      >
        <Stack
          direction={workspaceLayout ? 'row' : { xs: 'column', sm: 'row' }}
          alignItems={workspaceLayout ? 'center' : undefined}
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="subtitle1">
              {compact && mode === 'admissions' ? 'Payment' : 'Fee structure'}
            </Typography>
            {mode === 'admissions' && (
              <CustomTooltip title="A confirmed payment is sufficient. Finance-verified zero payable needs no payment entry. Authorized staff can instead collect later in Onboarding with a reason.">
                <IconButton
                  size="small"
                  color="info"
                  aria-label="Fee structure information"
                  sx={{ width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } }}
                >
                  <Iconify icon="mdi:information-outline" width={16} />
                </IconButton>
              </CustomTooltip>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            {mode === 'admissions' && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:refresh" width={16} />}
                disabled={query.isFetching || continuing || editing || collectionOpen}
                onClick={() => {
                  query.refetch();
                  if (showCollection) {
                    dispatch(
                      api.util.invalidateTags([
                        { type: financeModuleType.feeCollection, id: applicationId },
                      ])
                    );
                  }
                }}
              >
                Refresh
              </Button>
            )}
            {!workspaceLayout && selectionAction}
          </Stack>
        </Stack>
        {query.isError && (
          <StudentFeedback
            notificationKey="STU-0350"
            presentation="toast"
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Fee structure details could not be refreshed. Your unsaved selection is preserved. Retry
            before saving or confirming.
          </StudentFeedback>
        )}
        <Box
          sx={
            workspaceLayout
              ? {
                  display: 'grid',
                  gridTemplateColumns: showCollection
                    ? { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }
                    : 'minmax(0, 1fr)',
                  gap: 2,
                  flex: 1,
                  minWidth: 0,
                  alignItems: 'stretch',
                }
              : { display: 'flex', flexDirection: 'column', gap: 1.5 }
          }
        >
          <Stack
            component={workspaceLayout ? 'section' : 'div'}
            aria-label={workspaceLayout ? 'Fee structure' : undefined}
            spacing={1.5}
            useFlexGap
            sx={
              workspaceLayout
                ? { p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5, minWidth: 0 }
                : undefined
            }
          >
            {workspaceLayout && (
              <Typography variant="subtitle2" component="h3">
                Fee structure
              </Typography>
            )}
            {showEditor ? (
              <AdmissionFeeSelectionEditor
                key={applicationId}
                state={state}
                disabled={query.isError || query.isFetching || continuing}
                onClose={() => {
                  setEditing(false);
                }}
                onEditorStateChange={onEditorStateChange}
                compact={compact}
              />
            ) : query.isFetching ? (
              <Stack role="status" aria-label="Refreshing fee structure" aria-busy spacing={1.5}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="75%" height={20} />
                <Stack
                  spacing={1.5}
                  sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                >
                  <Skeleton variant="text" width={160} height={24} />
                  {[0, 1, 2].map((row) => (
                    <Stack key={row} direction="row" justifyContent="space-between" spacing={2}>
                      <Skeleton variant="text" width="60%" height={40} />
                      <Skeleton variant="text" width="20%" height={40} />
                    </Stack>
                  ))}
                </Stack>
                {workspaceLayout && (
                  <Stack
                    spacing={1.5}
                    sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                  >
                    <Skeleton variant="text" width={148} height={24} />
                    {[0, 1, 2, 3, 4].map((row) => (
                      <Stack key={row} direction="row" justifyContent="space-between" spacing={2}>
                        <Skeleton variant="text" width="35%" height={22} />
                        <Skeleton variant="text" width="40%" height={22} />
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            ) : selection ? (
              <>
                <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                  {selection.structureName} · Revision {selection.revisionNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fee structure confirmed {fDateTime(selection.savedAt)}
                  {state.ownerStageName ? ` in ${state.ownerStageName}` : ''}
                </Typography>
                {compact && mode === 'admissions' ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        lg: 'minmax(0, 1fr)',
                      },
                      gap: 1.5,
                    }}
                  >
                    <Stack
                      spacing={1.5}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        minWidth: 0,
                      }}
                    >
                      <Typography variant="subtitle2">Published fee heads</Typography>
                      <AdmissionFeeHeads heads={selection.heads} currency={selection.currency} />
                    </Stack>
                    <AdmissionFeeSelectionSummary
                      structureName={selection.structureName}
                      revisionNumber={selection.revisionNumber}
                      heads={selection.heads}
                      currency={selection.currency}
                    />
                  </Box>
                ) : (
                  <AdmissionFeeHeads heads={selection.heads} currency={selection.currency} />
                )}
              </>
            ) : workspaceLayout ? (
              <EmptyContent
                title={
                  <Stack component="span" spacing={1.5} alignItems="center">
                    <Iconify
                      icon="mdi:file-document-outline"
                      width={32}
                      sx={{ color: 'text.disabled' }}
                    />
                    <Typography component="span" variant="subtitle2" color="text.primary">
                      No fee structure selected
                    </Typography>
                  </Stack>
                }
                description={
                  readOnly
                    ? 'No fee structure was selected in this step.'
                    : 'Select a published structure to enable fee collection.'
                }
                sx={{ flex: 1, height: 'auto', py: 3, minWidth: 0 }}
                slotProps={{
                  img: { display: 'none' },
                  description: { typography: 'body2', color: 'text.secondary' },
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {readOnly
                  ? 'No fee structure was selected in this step.'
                  : 'Select a fee structure to collect fees now, or continue with a reason to collect later in Onboarding.'}
              </Typography>
            )}
            {workspaceLayout &&
              !showEditor &&
              (selectionAction || (!showCollection && deferralAction)) && (
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  justifyContent="flex-end"
                  sx={{ mt: 'auto', pt: 1.5, borderTop: 1, borderColor: 'divider' }}
                >
                  {!showCollection && deferralAction}
                  {selectionAction}
                </Stack>
              )}
            {workspaceLayout && !showCollection && showEditor && deferralAction}
          </Stack>
          {showCollection && (
            <AdmissionFeeCollectionPanel
              key={applicationId}
              applicationId={applicationId}
              refreshing={query.isFetching}
              disabled={
                query.isError || query.isFetching || editorBlocked || continuing || showEditor
              }
              onOpenChange={collectionOpenChanged}
              stretch={workspaceLayout}
              footerAction={workspaceLayout ? deferralAction : undefined}
            />
          )}
        </Box>
        {!workspaceLayout && deferralAction && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary">
              {state.hasRecordedFeePayment
                ? 'Any unpaid balance remains available for collection in Onboarding.'
                : 'Collection is optional at this stage. A reason is required to collect later.'}
            </Typography>
            {deferralAction}
          </Stack>
        )}
        {state.feeCollectionDeferral && (
          <StudentFeedback notificationKey="STU-0352" presentation="inline" severity="info">
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Collection deferred to Onboarding</Typography>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
                {state.feeCollectionDeferral.reason}
              </Typography>
              <Typography variant="caption">
                {fDateTime(state.feeCollectionDeferral.deferredAt)}
              </Typography>
            </Stack>
          </StudentFeedback>
        )}
        {mode === 'admissions' && !readOnly && state.paymentCompletion?.blocker && !editing && (
          <StudentFeedback notificationKey="STU-0353" presentation="inline" severity="info">
            {state.paymentCompletion.blocker}
          </StudentFeedback>
        )}
        {mode === 'admissions' && state.paymentCompletion?.status === 'financeCleared' && (
          <StudentFeedback notificationKey="STU-0353" presentation="inline" severity="success">
            Finance confirms no outstanding amount. No further payment is required.
          </StudentFeedback>
        )}
        {onContinue && !readOnly && mode === 'admissions' && (
          <Stack spacing={1}>
            {selection && (
              <StudentFeedback notificationKey="STU-0353" presentation="inline" severity="success">
                Fee structure confirmed.
              </StudentFeedback>
            )}
            <Button
              size="small"
              variant="contained"
              sx={{
                alignSelf: 'flex-end',
              }}
              disabled={
                !canContinue ||
                continuing ||
                editing ||
                !selection ||
                state.paymentCompletion?.canComplete !== true ||
                collectionOpen ||
                query.isFetching ||
                query.isError ||
                (Boolean(completionStageId) && state.currentStageId !== completionStageId)
              }
              onClick={onContinue}
            >
              {continuing ? 'Continuing...' : 'Continue'}
            </Button>
          </Stack>
        )}
        {state.isLocked && (
          <StudentFeedback notificationKey="STU-0354" presentation="inline" severity="info">
            Payment has been recorded. This fee selection is locked; ask Finance to review any
            adjustment or refund.
          </StudentFeedback>
        )}
        {!canEdit && !state.isLocked && mode === 'admissions' && state.ownerStageName && (
          <Typography variant="caption" color="text.secondary">
            Fee structure selection is managed in {state.ownerStageName} by authorized admissions
            staff.
          </Typography>
        )}
        {mode === 'onboarding' && selection && (
          <>
            <StudentFeedback
              notificationKey="STU-0355"
              presentation="inline"
              severity={state.onboardingConfirmed && !state.onboardingBlocker ? 'success' : 'info'}
            >
              {state.onboardingConfirmed
                ? 'The admission fee selection has been confirmed for Onboarding.'
                : 'Review and confirm the saved admission fee selection before completing Onboarding.'}
            </StudentFeedback>
            {state.onboardingBlocker && (
              <StudentFeedback
                notificationKey="STU-0356"
                presentation="persistent"
                severity="warning"
              >
                {state.onboardingBlocker}
              </StudentFeedback>
            )}
            {confirmationError && (
              <StudentFeedback
                notificationKey="STU-0357"
                presentation="persistent"
                severity="error"
              >
                {confirmationError}
              </StudentFeedback>
            )}
            {canConfirmSelection && (
              <Button
                size="small"
                variant="contained"
                disabled={confirmState.isLoading || query.isFetching || query.isError}
                sx={{ alignSelf: 'flex-start' }}
                onClick={async () => {
                  setConfirmationError(undefined);
                  try {
                    await confirm({
                      applicationId,
                      concurrencyStamp: state.concurrencyStamp,
                    }).unwrap();
                    shikshaMitraToast.success({
                      message: 'Admission fee selection confirmed for Onboarding.',
                    });
                  } catch (error) {
                    setConfirmationError(
                      parseApiProblemDetail(error).detail ||
                        'The selection could not be confirmed. Reload and try again.'
                    );
                  }
                }}
              >
                {confirmState.isLoading ? 'Confirming…' : 'Confirm admission fee selection'}
              </Button>
            )}
            {!state.onboardingConfirmed && !canConfirmSelection && !state.onboardingBlocker && (
              <Typography variant="caption" color="text.secondary">
                An authorized Student Onboarding user must confirm the saved selection.
              </Typography>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}

export { AdmissionFeeHeads } from './admission-fee-selection-summary';
