'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Box,
  Alert,
  Stack,
  Button,
  Skeleton,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useGetAdmissionFeeSelectionQuery,
  useConfirmAdmissionFeeSelectionOnboardingMutation,
} from 'src/redux/student/admissions/admission-fee-selection-api';

import { AdmissionFeeSelectionEditor } from './admission-fee-selection-editor';
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
  onEditorStateChange,
  compact = false,
  readOnly = false,
  onReadinessChange,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canRead = hasGrantedPermission(permissions, readPermissions);
  const query = useGetAdmissionFeeSelectionQuery(applicationId, {
    skip: !applicationId || !canRead,
  });
  const [editing, setEditing] = useState(false);
  const [editorDismissed, setEditorDismissed] = useState(false);
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
    ) : (
      <Box aria-label="Loading fee structure">
        <Skeleton height={90} />
      </Box>
    );
  if (!state)
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Fee structure details could not be loaded.
      </Alert>
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
  const showEditor = canEdit && (editing || (compact && !selection && !editorDismissed));

  return (
    <Box
      component="section"
      aria-label="Fee structure"
      sx={{
        minWidth: 0,
        ...(outlined &&
          !compact && { p: 2.5, mb: 2, border: 1, borderColor: 'divider', borderRadius: 2 }),
      }}
    >
      <Stack spacing={compact ? 1 : 1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="subtitle1">
              {compact && mode === 'admissions' ? 'Fee structure confirmation' : 'Fee structure'}
              {state.isRequired && !selection ? ' *' : ''}
            </Typography>
            {mode === 'admissions' && (
              <CustomTooltip title="Confirm the published fee structure and any optional fee heads. Finance handles fee assignment, dues and payment separately.">
                <IconButton size="small" color="info" aria-label="Fee structure information">
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
                disabled={query.isFetching || continuing || editing}
                onClick={() => query.refetch()}
              >
                Refresh
              </Button>
            )}
            {canEdit && !showEditor && (
              <Button
                size="small"
                variant={compact && !selection ? 'contained' : 'outlined'}
                sx={compact ? { alignSelf: 'flex-start' } : undefined}
                disabled={query.isFetching || query.isError || continuing}
                onClick={() => setEditing(true)}
              >
                {selection ? 'Change fee structure' : 'Select fee structure'}
              </Button>
            )}
          </Stack>
        </Stack>
        {query.isFetching && <LinearProgress aria-label="Refreshing fee structure" />}
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Fee structure details could not be refreshed. Your unsaved selection is preserved. Retry
            before saving or confirming.
          </Alert>
        )}
        {showEditor ? (
          <AdmissionFeeSelectionEditor
            key={applicationId}
            state={state}
            disabled={query.isError || query.isFetching || continuing}
            onClose={() => {
              setEditing(false);
              setEditorDismissed(true);
            }}
            onEditorStateChange={onEditorStateChange}
            compact={compact}
          />
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
                    lg: 'minmax(0, 1.2fr) minmax(0, 1fr)',
                  },
                  gap: 1.5,
                }}
              >
                <Stack
                  spacing={1.5}
                  sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5, minWidth: 0 }}
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
            <Typography variant="caption" color="text.secondary">
              Published amounts are shown for reference. Fee assignment and payment readiness remain
              managed in Finance.
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {state.isRequired
              ? 'Confirm the applicable Finance fee structure before completing this step.'
              : 'No fee structure selected. Selection is optional for this application.'}
          </Typography>
        )}
        {onContinue && !readOnly && mode === 'admissions' && (
          <Stack spacing={1}>
            {selection && <Alert severity="success">Fee structure confirmed.</Alert>}
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
          <Alert severity="info">
            Payment has been recorded. This fee selection is locked; ask Finance to review any
            adjustment or refund.
          </Alert>
        )}
        {!canEdit && !state.isLocked && mode === 'admissions' && state.ownerStageName && (
          <Typography variant="caption" color="text.secondary">
            Fee structure selection is managed in {state.ownerStageName} by authorized admissions
            staff.
          </Typography>
        )}
        {mode === 'onboarding' && selection && (
          <>
            <Alert
              severity={state.onboardingConfirmed && !state.onboardingBlocker ? 'success' : 'info'}
            >
              {state.onboardingConfirmed
                ? 'The admission fee selection has been confirmed for Onboarding.'
                : 'Review and confirm the saved admission fee selection before completing Onboarding.'}
            </Alert>
            {state.onboardingBlocker && <Alert severity="warning">{state.onboardingBlocker}</Alert>}
            {confirmationError && <Alert severity="error">{confirmationError}</Alert>}
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
