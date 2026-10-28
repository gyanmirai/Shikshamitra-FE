'use client';

import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Alert, Stack, Button, Divider, Typography } from '@mui/material';
import { SetupInlineDrawer } from 'src/screens/hr/setup/hr-setup-editor-context';
import {
  usePreviewLeavePolicyImpactMutation,
  useGetLeavePolicyImpactDetailsMutation,
} from 'src/redux/hr/leaveApi';

import { DrawerHeader } from '../components/HRPolicySharedUI';
import { getErrorMessage } from '../hr-policy-workspace-utils';

import type {
  LeaveImpactPage,
  LeaveImpactReview,
  LeaveImpactRequest,
  LeaveReviewApproval,
} from '../leave-impact.types';

const label = (key: string) =>
  key
    .replaceAll('_', ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());

export function useLeavePolicyImpactReview(academicYearId?: string) {
  const [preview] = usePreviewLeavePolicyImpactMutation();
  const [details] = useGetLeavePolicyImpactDetailsMutation();
  const [request, setRequest] = useState<LeaveImpactRequest | null>(null);
  const [review, setReview] = useState<LeaveImpactReview | null>(null);
  const [page, setPage] = useState<LeaveImpactPage | null>(null);
  const [metric, setMetric] = useState('');
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [busy, setBusy] = useState(false);
  const sequence = useRef(0);
  const detailSequence = useRef(0);
  const resolve = useRef<((approval: LeaveReviewApproval | null) => void) | null>(null);
  const resetDetails = useCallback(() => {
    setMetric('');
    setOffset(0);
    setPage(null);
    setDetailError('');
  }, []);
  const close = useCallback(() => {
    sequence.current += 1;
    detailSequence.current += 1;
    resolve.current?.(null);
    resolve.current = null;
    setRequest(null);
    setReview(null);
    resetDetails();
    setError('');
    setBusy(false);
  }, [resetDetails]);
  useEffect(() => close(), [academicYearId, close]);
  useEffect(
    () => () => {
      sequence.current += 1;
      detailSequence.current += 1;
      resolve.current?.(null);
    },
    []
  );

  const requestReview = useCallback(
    (assessment: LeaveImpactRequest): Promise<LeaveReviewApproval | null> => {
      resolve.current?.(null);
      sequence.current += 1;
      const id = sequence.current;
      detailSequence.current += 1;
      setRequest(assessment);
      setReview(null);
      resetDetails();
      setError('');
      setBusy(true);
      const outcome = new Promise<LeaveReviewApproval | null>((done) => {
        resolve.current = done;
      });
      Promise.resolve()
        .then(() => preview(assessment).unwrap())
        .then((result) => {
          if (id === sequence.current) setReview(result);
        })
        .catch((failure) => {
          if (id === sequence.current)
            setError(
              getErrorMessage(failure, 'Could not calculate leave impact. Close and retry.')
            );
        })
        .finally(() => {
          if (id === sequence.current) setBusy(false);
        });
      return outcome;
    },
    [preview, resetDetails]
  );

  const loadDetails = async (key: string, skipCount = 0) => {
    if (!request || !review) return;
    detailSequence.current += 1;
    const id = detailSequence.current;
    setMetric(key);
    setOffset(skipCount);
    setPage(null);
    setDetailError('');
    try {
      const result = await details({
        assessment: request,
        fingerprint: review.impact.fingerprint,
        metric: key,
        skipCount,
        maxResultCount: 20,
      }).unwrap();
      if (id === detailSequence.current) setPage(result);
    } catch (failure) {
      if (id === detailSequence.current)
        setDetailError(
          getErrorMessage(
            failure,
            'Could not load records. Your read scope may be restricted, or this assessment may need refreshing.'
          )
        );
    }
  };
  const expired = Boolean(review?.expiresAt && Date.parse(review.expiresAt) <= Date.now());
  const blocked = Boolean(
    !review ||
    review.blockingWarnings.length ||
    review.impact.completeness !== 'reference_assessment_complete' ||
    expired ||
    (review.requiresConfirmation && !review.confirmationToken)
  );
  const drawer = (
    <SetupInlineDrawer
      anchor="right"
      open={Boolean(request)}
      onClose={close}
      PaperProps={{ sx: { width: { xs: '100%', md: 720 } } }}
    >
      <DrawerHeader
        title={request?.action === 'inspect' ? 'Leave policy impact' : 'Review leave policy change'}
        helpText="Review the exact proposal, effective staff and pinned references. Existing requests and settlements keep their original rules."
        onClose={close}
      />
      <Divider />
      <Stack spacing={2} sx={{ p: 2.5, overflow: 'auto', flex: 1 }}>
        {busy ? <Alert severity="info">Calculating server assessment…</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        {review ? (
          <>
            <Typography variant="body2">
              As of {review.impact.asOfDate.slice(0, 10)} | Window{' '}
              {review.impact.fromDate.slice(0, 10)} to {review.impact.toDate.slice(0, 10)} | Version{' '}
              {review.currentVersion ?? 'new'} to {review.proposedVersion}
            </Typography>
            <HrNotice severity="info">{review.impact.limitation}</HrNotice>
            {[...review.warnings, ...review.blockingWarnings].map((warning, i) => (
              <Alert
                key={`${warning.code}-${i}`}
                severity={warning.severity === 'blocking' ? 'error' : 'warning'}
              >
                {warning.message}
              </Alert>
            ))}
            {expired ? (
              <Alert severity="warning">
                This review expired. Close and review again before saving.
              </Alert>
            ) : null}
            {review.differences?.length ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Proposed changes</Typography>
                {review.differences.map((diff) => (
                  <Box key={diff.fieldKey}>
                    <Typography variant="body2" fontWeight={600}>
                      {diff.fieldLabel}
                    </Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {diff.fromDisplayValue || '—'} to {diff.toDisplayValue || '—'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : null}
            <Typography variant="subtitle2">Reference assessment</Typography>
            {Object.entries(review.impact.measures).map(([key, measure]) => (
              <Box key={key} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={600}>
                    {label(key)}:{' '}
                    {measure.status === 'calculated' && measure.count !== null
                      ? measure.count
                      : label(measure.status)}
                  </Typography>
                  {measure.drilldownKey ? (
                    <Button size="small" onClick={() => loadDetails(measure.drilldownKey!)}>
                      View records
                    </Button>
                  ) : null}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {measure.definition} Scope: {label(measure.scope)}.
                </Typography>
                {measure.availabilityReason ? (
                  <Typography variant="body2">{measure.availabilityReason}</Typography>
                ) : null}
              </Box>
            ))}
            {metric ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">{label(metric)} records</Typography>
                {detailError ? (
                  <Alert severity="error">{detailError}</Alert>
                ) : !page ? (
                  <Typography>Loading records…</Typography>
                ) : (
                  <>
                    <Typography variant="body2">
                      {page.totalCount} accessible of {page.assessedTotalCount} assessed;{' '}
                      {page.redactedCount} outside your read scope.
                    </Typography>
                    {page.isScopeRestricted ? (
                      <HrNotice severity="info">
                        Records are limited to your authorized scope. The safety assessment includes
                        tenant-wide references.
                      </HrNotice>
                    ) : null}
                    {page.items.map((row) => (
                      <Box key={row.id}>
                        <Typography variant="body2">
                          {row.label} | {row.status}
                          {row.period ? ` | ${row.period}` : ''}
                        </Typography>
                        {row.currentSource || row.proposedSource ? (
                          <Typography variant="caption">
                            {row.currentSource || '—'} to {row.proposedSource || '—'}
                          </Typography>
                        ) : null}
                      </Box>
                    ))}
                    <Stack direction="row" spacing={1}>
                      <Button
                        disabled={!offset}
                        onClick={() => loadDetails(metric, Math.max(0, offset - 20))}
                      >
                        Previous
                      </Button>
                      <Button
                        disabled={offset + 20 >= page.totalCount}
                        onClick={() => loadDetails(metric, offset + 20)}
                      >
                        Next
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            ) : null}
            {review.impact.payrollPeriods.length ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Payroll periods to review</Typography>
                {review.impact.payrollPeriods.map((period) => (
                  <Typography key={period.month} variant="body2">
                    {period.month}: {label(period.lockState)} | {period.snapshotEmployeeCount}{' '}
                    snapshot staff | {period.settlementEmployeeCount} settlement staff
                  </Typography>
                ))}
              </Stack>
            ) : null}
          </>
        ) : null}
      </Stack>
      <Divider />
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
        <Button onClick={close}>Close</Button>
        {request?.action !== 'inspect' ? (
          <Button
            variant="contained"
            disabled={busy || blocked}
            onClick={() => {
              if (!review || !request || blocked) return;
              resolve.current?.({
                impactToken: review.confirmationToken,
                impactScope: {
                  asOfDate: request.asOfDate,
                  fromDate: request.fromDate,
                  toDate: request.toDate,
                  expectedVersion: request.expectedVersion,
                },
              });
              resolve.current = null;
              close();
            }}
          >
            Confirm and save
          </Button>
        ) : null}
      </Stack>
    </SetupInlineDrawer>
  );
  return { requestReview, drawer };
}
