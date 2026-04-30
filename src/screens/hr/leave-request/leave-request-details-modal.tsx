'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Table,
  Avatar,
  Button,
  Divider,
  Skeleton,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Typography,
  CardContent,
  DialogActions,
} from '@mui/material';
import {
  useGetMyLeaveBalanceQuery,
  useGetLeaveRequestByIdQuery,
  useGetSelfLeaveBalanceQuery,
  useLazyGetLeaveRequestsQuery,
  useGetMyLeaveRequestByIdQuery,
  useCancelLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useLazyGetMyLeaveRequestsQuery,
  useCancelMyLeaveRequestMutation,
} from 'src/redux/hr/leaveApi';

import {
  getLeaveStatusColor,
  getLeaveStatusLabel,
  normalizeLeaveStatus,
} from './leave-status.utils';
import {
  stripHtml,
  getLeaveRequestReason,
  findMatchingBalanceItem,
  buildRecentLeaveRequests,
  getNormalizedBalanceMetrics,
} from './leave-request-details.utils';

const HISTORY_PAGE_SIZE = 100;

type LeaveRequestDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  editData: any;
  historyItems?: any[];
  mode?: 'hr' | 'self';
  canReviewLeaves?: boolean;
  allowCancel?: boolean;
  onActionSuccess?: () => void | Promise<void>;
};

const SectionTitle = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) => (
  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
    <Iconify icon={icon} width={20} />
    <Box>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Stack>
);

const SectionShell = ({
  title,
  subtitle,
  icon,
  children,
  minHeight,
}: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
  minHeight?: number;
}) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 2.5,
      minHeight,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))',
      borderColor: 'rgba(255,255,255,0.08)',
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <SectionTitle icon={icon} title={title} subtitle={subtitle} />
      <Divider sx={{ mb: 2 }} />
      {children}
    </CardContent>
  </Card>
);

const BalanceMetricRow = ({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
}) => (
  <Stack spacing={0.75}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
    <Box sx={{ height: 8, borderRadius: 99, bgcolor: 'action.hover', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%',
          width: `${Math.max(4, Math.round(percent))}%`,
          bgcolor: color,
          transition: 'width 260ms ease',
        }}
      />
    </Box>
  </Stack>
);

const SummaryItem = ({
  label,
  value,
  loading = false,
}: {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}) => (
  <Box
    sx={{
      border: (t) => `1px solid ${t.palette.divider}`,
      borderRadius: 2,
      px: 1.5,
      py: 1.25,
      minHeight: 72,
      bgcolor: 'background.paper',
    }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {label}
    </Typography>
    {loading ? (
      <Skeleton variant="text" width="75%" />
    ) : (
      <Typography variant="subtitle2">{value}</Typography>
    )}
  </Box>
);

const DetailRow = ({
  label,
  value,
  loading = false,
}: {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}) => (
  <Grid container spacing={1.5} sx={{ py: 1 }}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <Typography variant="body2" fontWeight={600} color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid size={{ xs: 12, sm: 8 }}>
      {loading ? (
        <Skeleton variant="text" width="70%" />
      ) : (
        <Typography variant="body2">{value}</Typography>
      )}
    </Grid>
  </Grid>
);

const EmptyBlock = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <Stack
    spacing={1}
    alignItems="center"
    justifyContent="center"
    sx={{
      minHeight: 168,
      border: (t) => `1px dashed ${t.palette.divider}`,
      borderRadius: 2,
      px: 2,
    }}
  >
    <Iconify icon={icon} width={32} color="text.disabled" />
    <Typography variant="subtitle2">{title}</Typography>
    <Typography variant="body2" color="text.secondary" textAlign="center">
      {description}
    </Typography>
  </Stack>
);

const LeaveRequestDetailsModal = ({
  open,
  onClose,
  editData,
  historyItems: providedHistoryItems,
  mode = 'hr',
  canReviewLeaves = false,
  allowCancel = false,
  onActionSuccess,
}: LeaveRequestDetailsModalProps) => {
  const theme = useTheme();
  const isSelfMode = mode === 'self';
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { employee } = useSelector((state: RootState) => state.auth);
  const currentEmployeeId = String(employee?.id ?? '');
  const confirmCancel = useBoolean();
  const [actionRemarks, setActionRemarks] = useState('');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyReloadKey, setHistoryReloadKey] = useState(0);
  const [triggerLeaveRequests] = useLazyGetLeaveRequestsQuery();
  const [triggerMyLeaveRequests] = useLazyGetMyLeaveRequestsQuery();
  const [approveLeaveRequest, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
  const [rejectLeaveRequest, { isLoading: isRejecting }] = useRejectLeaveRequestMutation();
  const [cancelLeaveRequest, { isLoading: isCancellingForHr }] = useCancelLeaveRequestMutation();
  const [cancelMyLeaveRequest, { isLoading: isCancellingForSelf }] =
    useCancelMyLeaveRequestMutation();

  const requestId = editData?.id;
  const hasProvidedHistory = Array.isArray(providedHistoryItems);

  useEffect(() => {
    if (!open) {
      setActionRemarks('');
    }
  }, [open, requestId]);

  useEffect(() => {
    if (!hasProvidedHistory) {
      return;
    }

    setHistoryItems(providedHistoryItems ?? []);
    setIsHistoryLoading(false);
  }, [hasProvidedHistory, providedHistoryItems]);

  const {
    data: leaveDetailForHr,
    isLoading: isHrDetailLoading,
    isFetching: isHrDetailFetching,
    refetch: refetchHrDetail,
  } = useGetLeaveRequestByIdQuery({ id: requestId }, { skip: !open || !requestId || isSelfMode });

  const {
    data: leaveDetailForSelf,
    isLoading: isSelfDetailLoading,
    isFetching: isSelfDetailFetching,
    refetch: refetchSelfDetail,
  } = useGetMyLeaveRequestByIdQuery(
    { id: requestId },
    { skip: !open || !requestId || !isSelfMode }
  );

  const detail = useMemo(
    () => (isSelfMode ? leaveDetailForSelf : leaveDetailForHr) ?? editData,
    [editData, isSelfMode, leaveDetailForHr, leaveDetailForSelf]
  );

  const targetEmployeeId = detail?.employeeId ?? editData?.employeeId;
  const historySearchTerm = isSelfMode
    ? undefined
    : detail?.employeeCode ||
      editData?.employeeIdentifier ||
      detail?.employeeName ||
      editData?.name;
  const balanceAcademicYearId = currentYear?.id;

  const {
    data: balancesForHr,
    isLoading: isHrBalancesLoading,
    isFetching: isHrBalancesFetching,
    refetch: refetchHrBalances,
  } = useGetMyLeaveBalanceQuery(
    { academicYearId: balanceAcademicYearId, employeeId: targetEmployeeId },
    { skip: !open || !balanceAcademicYearId || !targetEmployeeId || isSelfMode }
  );

  const {
    data: balancesForSelf,
    isLoading: isSelfBalancesLoading,
    isFetching: isSelfBalancesFetching,
    refetch: refetchSelfBalances,
  } = useGetSelfLeaveBalanceQuery(
    { academicYearId: balanceAcademicYearId },
    { skip: !open || !balanceAcademicYearId || isSelfMode === false }
  );

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      if (hasProvidedHistory) {
        setHistoryItems(providedHistoryItems ?? []);
        setIsHistoryLoading(false);
        return;
      }

      if (!open || !currentYear?.id || (!isSelfMode && !historySearchTerm)) {
        setHistoryItems([]);
        setIsHistoryLoading(false);
        return;
      }

      setIsHistoryLoading(true);

      try {
        const trigger = isSelfMode ? triggerMyLeaveRequests : triggerLeaveRequests;
        const response = await trigger(
          {
            academicYearId: currentYear.id,
            page: 1,
            pageSize: HISTORY_PAGE_SIZE,
            search: historySearchTerm,
          },
          false
        ).unwrap();

        if (active) {
          setHistoryItems(Array.isArray(response?.items) ? response.items : []);
        }
      } catch (error) {
        if (active) {
          console.error(error);
          setHistoryItems([]);
        }
      } finally {
        if (active) {
          setIsHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [
    currentYear?.id,
    hasProvidedHistory,
    historyReloadKey,
    historySearchTerm,
    isSelfMode,
    open,
    providedHistoryItems,
    triggerLeaveRequests,
    triggerMyLeaveRequests,
  ]);

  const matchedBalance = useMemo(() => {
    const leaveBalances = (isSelfMode ? balancesForSelf : balancesForHr)?.items ?? [];
    return findMatchingBalanceItem(detail, leaveBalances);
  }, [balancesForHr, balancesForSelf, detail, isSelfMode]);
  const isBalanceLoading = isSelfMode
    ? isSelfBalancesLoading || isSelfBalancesFetching
    : isHrBalancesLoading || isHrBalancesFetching;
  const isDetailLoading = isSelfMode
    ? isSelfDetailLoading || isSelfDetailFetching
    : isHrDetailLoading || isHrDetailFetching;
  const normalizedStatus = normalizeLeaveStatus(detail?.status ?? editData?.status);
  const isOwnRequest = String(targetEmployeeId ?? '') === currentEmployeeId;
  const canApproveReject = canReviewLeaves && normalizedStatus === 'PENDING' && !isOwnRequest;
  const canCancel = allowCancel && normalizedStatus === 'PENDING';
  const recentRequests = useMemo(
    () => buildRecentLeaveRequests(historyItems, detail?.id, targetEmployeeId),
    [detail?.id, historyItems, targetEmployeeId]
  );
  const balanceMetrics = useMemo(
    () => getNormalizedBalanceMetrics(matchedBalance),
    [matchedBalance]
  );
  const pendingRequestsCount = useMemo(
    () => recentRequests.filter((item) => item.normalizedStatus === 'PENDING').length,
    [recentRequests]
  );
  const requestReason = useMemo(() => getLeaveRequestReason(detail, editData), [detail, editData]);
  const attachmentUrl = detail?.attachmentUrl;
  const organizationLabel =
    detail?.mediumStageName || editData?.organization || editData?.mediumStageName || '-';
  const academicYearLabel =
    detail?.academicYearName ||
    detail?.academicYear?.name ||
    detail?.academicYear ||
    editData?.academicYearName ||
    currentYear?.name ||
    '-';
  const submittedByLabel = detail?.submittedByEmployeeCode
    ? `${detail?.submittedByName || '-'} (${detail.submittedByEmployeeCode})`
    : (detail?.submittedByName ?? '-');
  const startDateValue = dayjs(detail?.startDate ?? editData?.startDate ?? editData?.viewStartDate);
  const endDateValue = dayjs(detail?.endDate ?? editData?.endDate ?? editData?.viewEndDate);
  const summaryDateRange =
    startDateValue.year() === endDateValue.year()
      ? `${startDateValue.format('ddd, D MMM')} - ${endDateValue.format('ddd, D MMM YYYY')}`
      : `${startDateValue.format('ddd, D MMM YYYY')} - ${endDateValue.format('ddd, D MMM YYYY')}`;

  const refreshAllData = useCallback(async () => {
    await Promise.allSettled([
      isSelfMode ? refetchSelfDetail() : refetchHrDetail(),
      isSelfMode ? refetchSelfBalances() : refetchHrBalances(),
    ]);
    if (!hasProvidedHistory) {
      setHistoryReloadKey((prev) => prev + 1);
    }
  }, [
    hasProvidedHistory,
    isSelfMode,
    refetchHrBalances,
    refetchHrDetail,
    refetchSelfBalances,
    refetchSelfDetail,
  ]);

  const handleApprove = async () => {
    try {
      await approveLeaveRequest({
        id: detail?.id,
        body: {
          remarks: stripHtml(actionRemarks) || undefined,
        },
      }).unwrap();
      setActionRemarks('');
      await refreshAllData();
      await onActionSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async () => {
    const remarks = stripHtml(actionRemarks);
    if (!remarks) {
      return;
    }

    try {
      await rejectLeaveRequest({
        id: detail?.id,
        body: {
          remarks,
        },
      }).unwrap();
      setActionRemarks('');
      await refreshAllData();
      await onActionSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelRequest = async () => {
    try {
      const cancelRequest = isSelfMode ? cancelMyLeaveRequest : cancelLeaveRequest;
      await cancelRequest(detail?.id).unwrap();
      confirmCancel.onFalse();
      await refreshAllData();
      await onActionSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const isActionLoading = isApproving || isRejecting || isCancellingForHr || isCancellingForSelf;

  return (
    <>
      <CustomDialog
        open={open}
        handleClose={onClose}
        maxWidth="md"
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5">Leave Request Details</Typography>
            <Iconify icon="lucide:info" color="info.main" width={18} />
          </Stack>
        }
        paperProps={{
          sx: {
            minHeight: 620,
            maxHeight: '92vh',
          },
        }}
      >
        <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
          <Card
            sx={{
              mb: 2,
              borderRadius: 2.5,
              boxShadow: theme.customShadows?.z1 || theme.shadows[1],
              border: `1px solid ${theme.palette.divider}`,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.08))',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 2.25, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="solar:user-rounded-bold-duotone" width={26} />
                    </Avatar>
                    <Box>
                      {isDetailLoading ? (
                        <>
                          <Skeleton variant="text" width={220} height={34} />
                          <Skeleton variant="text" width={280} />
                        </>
                      ) : (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {detail?.employeeName || editData?.name || '-'} (
                            {detail?.employeeCode || editData?.employeeIdentifier || '-'})
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            color="primary.light"
                            sx={{ letterSpacing: 0.4 }}
                          >
                            {(detail?.leaveType || editData?.leaveType || '-').toUpperCase()}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Stack>
                  {isDetailLoading ? (
                    <Skeleton variant="rounded" width={140} height={38} />
                  ) : (
                    <Label color={getLeaveStatusColor(detail?.status ?? editData?.status)}>
                      {getLeaveStatusLabel(detail?.status ?? editData?.status)}
                    </Label>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8.4 }}>
              <SectionShell
                icon="solar:document-text-bold-duotone"
                title="Request Details"
                subtitle="Primary request context and justification"
                minHeight={420}
              >
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailRow
                      label="Submitted By"
                      value={submittedByLabel}
                      loading={isDetailLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailRow
                      label="Academic Year"
                      value={academicYearLabel}
                      loading={isDetailLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailRow
                      label="Organization"
                      value={organizationLabel}
                      loading={isDetailLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailRow
                      label="Pending Requests"
                      value={pendingRequestsCount}
                      loading={isHistoryLoading}
                    />
                  </Grid>
                </Grid>

                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reason
                  </Typography>
                  {isDetailLoading ? (
                    <Skeleton variant="rounded" height={54} />
                  ) : (
                    <Box
                      sx={{
                        border: (t) => `1px solid ${t.palette.divider}`,
                        borderRadius: 2,
                        px: 1.5,
                        py: 1.25,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="body1">{requestReason}</Typography>
                    </Box>
                  )}
                </Stack>

                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Remarks
                  </Typography>
                  {isDetailLoading ? (
                    <Skeleton variant="rounded" height={100} />
                  ) : (
                    <Box
                      sx={{
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                        bgcolor: 'background.paper',
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 1.25,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                      >
                        {`"${stripHtml(detail?.remarks) || '-'}"`}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: 2.25 }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Attachment
                  </Typography>
                  {isDetailLoading ? (
                    <Skeleton variant="rounded" width={128} height={34} />
                  ) : attachmentUrl ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      onClick={() => window.open(attachmentUrl, '_blank', 'noopener,noreferrer')}
                    >
                      View attachment
                    </Button>
                  ) : (
                    <Typography variant="body2">-</Typography>
                  )}
                </Stack>
              </SectionShell>
            </Grid>

            <Grid size={{ xs: 12, md: 3.6 }}>
              <SectionShell
                icon="solar:pie-chart-2-bold-duotone"
                title="Balance Context and Summary"
                subtitle="Summary first, then allocation overview"
                minHeight={420}
              >
                {matchedBalance || isBalanceLoading ? (
                  <Stack spacing={2}>
                    <Grid container spacing={1.25}>
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            border: (t) => `1px solid ${t.palette.divider}`,
                            borderRadius: 2,
                            px: 1.5,
                            py: 1.5,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Available balance
                          </Typography>
                          {isBalanceLoading ? (
                            <Skeleton variant="text" width={160} height={42} />
                          ) : (
                            <Stack
                              direction="row"
                              alignItems="baseline"
                              spacing={0.75}
                              sx={{ mt: 0.5 }}
                            >
                              <Typography variant="h3" fontWeight={800}>
                                {matchedBalance?.remainingDays ?? '-'}
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary">
                                days left
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <SummaryItem
                          label="Leave period"
                          value={summaryDateRange}
                          loading={isDetailLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <SummaryItem
                          label="Duration"
                          value={`${detail?.totalDays ?? editData?.totalDays ?? '-'} days`}
                          loading={isDetailLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <SummaryItem
                          label="Leave type"
                          value={matchedBalance?.leaveTypeName ?? detail?.leaveType ?? '-'}
                          loading={isBalanceLoading}
                        />
                      </Grid>
                    </Grid>
                    {isBalanceLoading ? (
                      <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                        <Skeleton variant="rounded" height={36} />
                        <Skeleton variant="rounded" height={36} />
                        <Skeleton variant="rounded" height={36} />
                      </Stack>
                    ) : (
                      <Stack spacing={1.25} sx={{ pt: 0.5 }}>
                        <BalanceMetricRow
                          label="Entitled"
                          value={balanceMetrics.entitledDays}
                          percent={balanceMetrics.entitledPct}
                          color={theme.palette.primary.light}
                        />
                        <BalanceMetricRow
                          label="Used"
                          value={balanceMetrics.usedDays}
                          percent={balanceMetrics.usedPct}
                          color={theme.palette.warning.main}
                        />
                        <BalanceMetricRow
                          label="Remaining"
                          value={balanceMetrics.remainingDays}
                          percent={balanceMetrics.remainingPct}
                          color={theme.palette.success.main}
                        />
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <EmptyBlock
                    icon="solar:wallet-money-bold-duotone"
                    title="No leave allocation found"
                    description="This request does not match any current leave balance entry for the selected academic year."
                  />
                )}
              </SectionShell>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SectionShell
                icon="solar:history-bold-duotone"
                title="Past Requests"
                subtitle="Recent requests for the same employee in this academic year"
              >
                {isHistoryLoading ? (
                  <Stack spacing={1}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} variant="rounded" height={42} />
                    ))}
                  </Stack>
                ) : recentRequests.length === 0 ? (
                  <EmptyBlock
                    icon="solar:clock-circle-bold-duotone"
                    title="No prior requests found"
                    description="There are no other leave requests for this employee in the selected academic year."
                  />
                ) : (
                  <Table size="small">
                    <TableBody>
                      {recentRequests.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell sx={{ minWidth: 180 }}>
                            <Stack spacing={0.25}>
                              <Typography variant="subtitle2">{item.leaveType}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {dayjs(item.startDate).format('DD MMM YYYY')} -{' '}
                                {dayjs(item.endDate).format('DD MMM YYYY')}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell width={110}>{item.totalDays}</TableCell>
                          <TableCell width={130}>
                            <Label color={getLeaveStatusColor(item.status)}>
                              {getLeaveStatusLabel(item.status)}
                            </Label>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 340 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={item.remarks || item.reason || ''}
                            >
                              {item.remarks || item.reason || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </SectionShell>
            </Grid>
          </Grid>

          {canApproveReject && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              Review remarks are optional for approval and required for rejection.
            </Alert>
          )}
        </Box>

        <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
          {canApproveReject && (
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={4}
              label="Action remarks"
              value={actionRemarks}
              onChange={(event) => setActionRemarks(event.target.value)}
              sx={{ mb: 2 }}
              placeholder="Add optional remarks for approval or required remarks for rejection."
            />
          )}
          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Close
            </Button>
            {canCancel && (
              <LoadingButton
                variant="outlined"
                color="error"
                size="small"
                loading={isCancellingForHr || isCancellingForSelf}
                onClick={confirmCancel.onTrue}
                startIcon={<Iconify icon={GlobalIcons.delete} />}
              >
                Cancel Request
              </LoadingButton>
            )}
            {canApproveReject && (
              <>
                <LoadingButton
                  variant="outlined"
                  color="error"
                  size="small"
                  loading={isRejecting}
                  disabled={!stripHtml(actionRemarks) || isActionLoading}
                  onClick={handleReject}
                  startIcon={<Iconify icon={GlobalIcons.reject} />}
                >
                  Reject
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  color="success"
                  size="small"
                  loading={isApproving}
                  disabled={isActionLoading}
                  onClick={handleApprove}
                  startIcon={<Iconify icon={GlobalIcons.approvedIcon} />}
                >
                  Approve
                </LoadingButton>
              </>
            )}
          </DialogActions>
        </Box>
      </CustomDialog>

      <ConfirmDialog
        open={confirmCancel.value}
        onClose={confirmCancel.onFalse}
        title="Cancel Leave Request"
        content={
          <>
            Are you sure you want to cancel this leave request for{' '}
            <strong>{detail?.employeeName || editData?.name || '-'}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isCancellingForHr || isCancellingForSelf}
            onClick={handleCancelRequest}
            startIcon={<Iconify icon={GlobalIcons.delete} sx={{ height: '16px', width: '16px' }} />}
          >
            Cancel Request
          </LoadingButton>
        }
      />
    </>
  );
};

export default LeaveRequestDetailsModal;
