'use client';

import type { RootState } from 'src/redux/store';
import type { LeaveYearEndSettlementRun, LeaveYearEndSettlementItem } from 'src/redux/hr/leaveApi';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useGetLeaveYearEndSettlementsQuery,
  useGetLeaveYearEndSettlementByIdQuery,
  usePreviewLeaveYearEndSettlementMutation,
  useFinalizeLeaveYearEndSettlementMutation,
} from 'src/redux/hr/leaveApi';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Table,
  Divider,
  TableRow,
  Collapse,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
  CircularProgress,
} from '@mui/material';

const ISSUE_LABELS: Record<string, string> = {
  pending_leave: 'Pending leave',
  missing_target_academic_year: 'Missing next year',
  missing_target_paid_rule: 'Missing target paid rule',
  payroll_locked: 'Payroll locked',
  payroll_preview_required: 'Payroll setup',
  payroll_basis_missing: 'Payroll basis',
  payroll_gross_missing: 'Gross missing',
};

const statusColor = (status?: string) => {
  const value = String(status || '').toLowerCase();
  if (value === 'finalized') return 'success';
  if (value === 'blocked') return 'warning';
  return 'info';
};

const formatDays = (value?: number | null) =>
  Number(value || 0)
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1');

const getIssueLabels = (item: LeaveYearEndSettlementItem) =>
  (item.issueCodes || []).map((code) => ISSUE_LABELS[code] || code);

export function LeaveYearEndSettlementsPanel() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id || '';
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const {
    data: runs = [],
    isLoading: runsLoading,
    isFetching: runsFetching,
  } = useGetLeaveYearEndSettlementsQuery({ academicYearId }, { skip: !academicYearId });

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) || runs[0] || null,
    [runs, selectedRunId]
  );

  const {
    data: runDetail,
    isFetching: detailFetching,
    refetch: refetchRunDetail,
  } = useGetLeaveYearEndSettlementByIdQuery(selectedRun?.id || '', {
    skip: !selectedRun?.id,
  });

  const [previewSettlement, previewState] = usePreviewLeaveYearEndSettlementMutation();
  const [finalizeSettlement, finalizeState] = useFinalizeLeaveYearEndSettlementMutation();

  const activeRun = runDetail || selectedRun;
  const items = activeRun?.items || [];
  const issueFreeDraftItems = items.filter(
    (item) =>
      String(item.status || '').toLowerCase() === 'draft' && (item.issueCodes || []).length === 0
  );
  const payrollMonths = Array.from(
    new Set(items.map((item) => item.payrollMonth).filter(Boolean))
  ) as string[];
  const loading = runsLoading || runsFetching || detailFetching;
  const isFinalized = String(activeRun?.status || '').toLowerCase() === 'finalized';
  const hasBlockedItems = Boolean(activeRun?.blockedItems && activeRun.blockedItems > 0);
  const canFinalize = Boolean(
    activeRun?.id && !isFinalized && !hasBlockedItems && issueFreeDraftItems.length > 0
  );

  useEffect(() => {
    if (!runs.length) {
      setSelectedRunId(null);
      return;
    }
    if (!selectedRunId || !runs.some((run) => run.id === selectedRunId)) {
      setSelectedRunId(runs[0].id);
    }
  }, [runs, selectedRunId]);

  const handlePreview = useCallback(async () => {
    if (!academicYearId) return;
    try {
      const run = await previewSettlement({ academicYearId }).unwrap();
      setSelectedRunId(run.id);
      setExpanded(true);
      shikshaMitraToast.success({ message: 'Year-end settlement preview refreshed.' });
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.data?.message || 'Failed to refresh year-end settlement preview.',
      });
    }
  }, [academicYearId, previewSettlement]);

  const handleFinalize = useCallback(async () => {
    if (!activeRun?.id) return;
    try {
      const run = await finalizeSettlement(activeRun.id).unwrap();
      setSelectedRunId(run.id);
      setConfirmOpen(false);
      await refetchRunDetail();
      shikshaMitraToast.success({ message: 'Year-end settlement finalized.' });
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.data?.message || 'Resolve blocked settlement items before finalizing.',
      });
    }
  }, [activeRun?.id, finalizeSettlement, refetchRunDetail]);

  const renderRunSummary = (run: LeaveYearEndSettlementRun | null) => {
    if (!run) return null;
    return (
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        <Chip size="small" label={run.status} color={statusColor(run.status) as any} />
        <Chip size="small" label={`${run.totalItems || 0} items`} variant="outlined" />
        <Chip size="small" label={`${run.blockedItems || 0} blocked`} variant="outlined" />
        <Chip size="small" label={`${formatDays(run.totalCarriedDays)} carried`} />
        <Chip size="small" label={`${formatDays(run.totalEncashedDays)} encashed`} />
        <Chip size="small" label={`${formatDays(run.totalForfeitedDays)} forfeited`} />
        <Chip
          size="small"
          label={formatCurrency(run.totalEncashmentAmount || 0)}
          color="warning"
          variant="outlined"
        />
      </Stack>
    );
  };

  return (
    <Card sx={{ p: 1.25 }}>
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1.25}
        >
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" label="Year-End Settlements" color="primary" variant="outlined" />
              {activeRun ? renderRunSummary(activeRun) : null}
            </Stack>
            {payrollMonths.length ? (
              <Typography variant="caption" color="text.secondary">
                Payroll month{payrollMonths.length > 1 ? 's' : ''}: {payrollMonths.join(', ')}
              </Typography>
            ) : null}
          </Stack>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
            <LoadingButton
              size="small"
              variant="outlined"
              loading={previewState.isLoading}
              disabled={!academicYearId}
              startIcon={<Iconify icon="solar:refresh-linear" />}
              onClick={handlePreview}
            >
              Preview
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="contained"
              color="warning"
              loading={finalizeState.isLoading}
              disabled={!canFinalize}
              startIcon={<Iconify icon="solar:check-circle-linear" />}
              onClick={() => setConfirmOpen(true)}
            >
              Finalize
            </LoadingButton>
            <IconButton
              size="small"
              aria-label={expanded ? 'Hide settlement details' : 'Show settlement details'}
              onClick={() => setExpanded(!expanded)}
            >
              <Iconify
                icon={
                  expanded ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'
                }
              />
            </IconButton>
          </Stack>
        </Stack>

        <Collapse in={expanded}>
          <Stack spacing={1.25} sx={{ mt: 1.25 }}>
            {!academicYearId ? (
              <Alert severity="warning">Select an academic year.</Alert>
            ) : loading && !activeRun ? (
              <Stack alignItems="center" sx={{ py: 2 }}>
                <CircularProgress size={22} />
              </Stack>
            ) : !activeRun ? (
              <Alert severity="info">No settlement run found.</Alert>
            ) : (
              <>
                {runs.length > 1 ? (
                  <Stack
                    direction="row"
                    spacing={0.75}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 1.25 }}
                  >
                    {runs.map((run) => (
                      <Chip
                        key={run.id}
                        clickable
                        size="small"
                        color={run.id === activeRun.id ? 'primary' : 'default'}
                        variant={run.id === activeRun.id ? 'filled' : 'outlined'}
                        label={`${run.status} ${run.previewedAt ? new Date(run.previewedAt).toLocaleDateString() : ''}`}
                        onClick={() => setSelectedRunId(run.id)}
                      />
                    ))}
                  </Stack>
                ) : null}

                <Divider />

                {items.length ? (
                  <TableContainer sx={{ maxHeight: 360 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Staff</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Accrued</TableCell>
                          <TableCell align="right">Carry In</TableCell>
                          <TableCell align="right">Used</TableCell>
                          <TableCell align="right">Pending</TableCell>
                          <TableCell align="right">Unused</TableCell>
                          <TableCell align="right">Carried</TableCell>
                          <TableCell align="right">Encashed</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Issues</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item) => {
                          const issueLabels = getIssueLabels(item);
                          return (
                            <TableRow key={item.id} hover>
                              <TableCell sx={{ minWidth: 180 }}>
                                <Stack spacing={0.25}>
                                  <Typography variant="body2" fontWeight={600} noWrap>
                                    {item.employeeName || '-'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {item.employeeCode || item.employeeId}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Label color={statusColor(item.status) as any}>{item.status}</Label>
                              </TableCell>
                              <TableCell align="right">{formatDays(item.accruedDays)}</TableCell>
                              <TableCell align="right">{formatDays(item.carryInDays)}</TableCell>
                              <TableCell align="right">
                                {formatDays(item.approvedUsedDays)}
                              </TableCell>
                              <TableCell align="right">{formatDays(item.pendingDays)}</TableCell>
                              <TableCell align="right">{formatDays(item.unusedDays)}</TableCell>
                              <TableCell align="right">{formatDays(item.carriedDays)}</TableCell>
                              <TableCell align="right">{formatDays(item.encashedDays)}</TableCell>
                              <TableCell align="right">
                                {formatCurrency(item.amount || 0)}
                              </TableCell>
                              <TableCell sx={{ minWidth: 170 }}>
                                {issueLabels.length ? (
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {issueLabels.map((label) => (
                                      <Chip
                                        key={label}
                                        size="small"
                                        label={label}
                                        color="warning"
                                      />
                                    ))}
                                  </Stack>
                                ) : (
                                  <Chip
                                    size="small"
                                    label="Clear"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">No eligible paid leave settlement items.</Alert>
                )}
              </>
            )}
          </Stack>
        </Collapse>
      </Stack>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Finalize settlement"
        icon="warning"
        content={
          <Box>
            <Typography variant="body2">
              Finalizing will carry {formatDays(activeRun?.totalCarriedDays)} day(s), encash{' '}
              {formatDays(activeRun?.totalEncashedDays)} day(s), and post{' '}
              {formatCurrency(activeRun?.totalEncashmentAmount || 0)} to payroll.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Finalization is all-or-nothing. Payroll posting will happen only if every settlement
              item is still clear after the backend refreshes the preview.
            </Typography>
            {hasBlockedItems ? (
              <Typography variant="caption" color="text.secondary">
                Resolve {activeRun?.blockedItems} blocked item(s), then refresh the preview.
              </Typography>
            ) : null}
          </Box>
        }
        action={
          <LoadingButton
            size="small"
            variant="contained"
            color="warning"
            loading={finalizeState.isLoading}
            disabled={!canFinalize}
            onClick={handleFinalize}
          >
            Finalize
          </LoadingButton>
        }
      />
    </Card>
  );
}
