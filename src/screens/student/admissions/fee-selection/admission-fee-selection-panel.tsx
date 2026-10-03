'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionFeeHead } from 'src/redux/student/admissions/admission-fee-selection-types';

import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { fNumber, fCurrency } from 'src/utils/format-number';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import {
  useGetAdmissionFeeSelectionQuery,
  useConfirmAdmissionFeeSelectionOnboardingMutation,
} from 'src/redux/student/admissions/admission-fee-selection-api';

import { AdmissionFeeSelectionEditor } from './admission-fee-selection-editor';
import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

import type { AdmissionFeeSelectionEditorState } from './admission-fee-selection-editor';

type Props = {
  applicationId: string;
  mode?: 'admissions' | 'onboarding';
  canConfirm?: boolean;
  outlined?: boolean;
  onEditorStateChange?: (state: AdmissionFeeSelectionEditorState) => void;
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
  onEditorStateChange,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canRead = hasGrantedPermission(permissions, readPermissions);
  const query = useGetAdmissionFeeSelectionQuery(applicationId, {
    skip: !applicationId || !canRead,
  });
  const [editing, setEditing] = useState(false);
  const [confirm, confirmState] = useConfirmAdmissionFeeSelectionOnboardingMutation();
  const [confirmationError, setConfirmationError] = useState<string>();
  const state = query.currentData;

  if (!canRead || !applicationId) return null;
  if (query.isLoading || (!state && query.isFetching))
    return (
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
    mode === 'admissions' &&
    state.canEdit &&
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const canConfirmSelection =
    mode === 'onboarding' &&
    canConfirm &&
    state.canConfirmOnboarding &&
    hasGrantedPermission(permissions, 'Students.Onboarding.Add');
  const { selection } = state;

  return (
    <Box
      component="section"
      aria-label="Fee structure"
      sx={{
        minWidth: 0,
        ...(outlined && { p: 2.5, mb: 2, border: 1, borderColor: 'divider', borderRadius: 2 }),
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle1">
            Fee structure{state.isRequired && !selection ? ' *' : ''}
          </Typography>
          {canEdit && !editing && (
            <Button
              size="small"
              variant="outlined"
              disabled={query.isFetching || query.isError}
              onClick={() => setEditing(true)}
            >
              {selection ? 'Change fee structure' : 'Select fee structure'}
            </Button>
          )}
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
        {editing && canEdit ? (
          <AdmissionFeeSelectionEditor
            key={applicationId}
            state={state}
            disabled={query.isError || query.isFetching}
            onClose={() => setEditing(false)}
            onEditorStateChange={onEditorStateChange}
          />
        ) : selection ? (
          <>
            <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
              {selection.structureName} · Revision {selection.revisionNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Saved {fDateTime(selection.savedAt)}
              {state.ownerStageName ? ` in ${state.ownerStageName}` : ''}
            </Typography>
            <AdmissionFeeHeads heads={selection.heads} currency={selection.currency} />
            <Typography variant="caption" color="text.secondary">
              Published amounts are shown for reference. Fee assignment and payment readiness remain
              managed in Finance.
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {state.isRequired
              ? 'Select a fee structure before collecting the configured fee or completing this step.'
              : 'No fee structure selected. Selection is optional for this application.'}
          </Typography>
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

export function AdmissionFeeHeads({
  heads,
  currency,
}: {
  heads: AdmissionFeeHead[];
  currency: string | null;
}) {
  return (
    <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5 }} aria-label="Selected fee heads">
      {heads.map((head) => (
        <Box component="li" key={head.feeHeadId} sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="body2">
            {head.feeHeadName} ·{' '}
            {currency
              ? head.isVariable
                ? 'Entered during Finance assignment'
                : fCurrency(head.configuredAmount ?? 0, { currency })
              : head.isVariable
                ? 'Entered during Finance assignment'
                : fNumber(head.configuredAmount ?? 0)}
            {head.isOptional ? ' · Optional' : ' · Mandatory'}
            {head.isOneTime ? ' · One-time' : ''}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
