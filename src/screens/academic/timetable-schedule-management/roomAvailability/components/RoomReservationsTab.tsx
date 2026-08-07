'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { Box, Paper, MenuItem, Tooltip, IconButton, Tabs, Tab } from '@mui/material';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Label, LabelColor } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CancelButton from 'src/components/cancel-button';

import { ApprovalStatusChip } from './RoomStatusChip';

import type { RoomReservation, ReservationStatus } from '../types';

type PendingAction = { id: string; type: 'approve' | 'reject' | 'cancel' } | null;

interface RoomReservationsTabProps {
  reservations: RoomReservation[];
  isLoading?: boolean;
  canApprove?: boolean;
  pendingAction?: PendingAction;
  onCancel?: (id: string) => Promise<void> | void;
  onApprove?: (id: string) => Promise<boolean> | void;
  onReject?: (id: string, reason: string) => Promise<boolean> | void;
  onEdit?: (reservation: RoomReservation) => void;
  onViewRoom?: (roomId: string) => void;
}

const STATUS_TABS: {
  value: ReservationStatus | 'all';
  label: string;
  color: LabelColor;
}[] = [
    { value: 'all', label: 'All', color: 'info' },
    { value: 'active', label: 'Active', color: 'primary' },
    { value: 'pendingApproval', label: 'Pending', color: 'warning' },
    { value: 'approved', label: 'Approved', color: 'success' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' },
    { value: 'rejected', label: 'Rejected', color: 'error' },
  ];

export const RoomReservationsTab = ({
  reservations,
  isLoading = false,
  canApprove = false,
  pendingAction,
  onCancel,
  onApprove,
  onReject,
  onEdit,
  onViewRoom,
}: RoomReservationsTabProps) => {
  const { data: session } = useSession() as any;
  const currentUserId = session?.profile?.sub;
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // True only for the specific row + action currently in flight; drives the
  // active action's loading spinner. Sibling/other-row actions are gated by
  // `isAnyActionPending` to prevent concurrent requests.
  const isBusy = (id: string, type: 'approve' | 'reject' | 'cancel') =>
    pendingAction?.id === id && pendingAction?.type === type;
  const isAnyActionPending = pendingAction !== null;

  const handleConfirmCancel = async () => {
    if (!cancelId) return;
    setIsCancelling(true);
    try {
      await onCancel?.(cancelId);
    } finally {
      setIsCancelling(false);
      setCancelId(null);
    }
  };

  const handleOpenReject = (id: string) => {
    setRejectTargetId(id);
    setRejectReason('');
    setRejectError('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is mandatory.');
      return;
    }
    setIsRejecting(true);
    try {
      const ok = await onReject?.(rejectTargetId, rejectReason);
      if (ok === false) return; // parent already showed the error toast
      setRejectDialogOpen(false);
    } finally {
      setIsRejecting(false);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return reservations;
    return reservations.filter((r) => r.status === filter);
  }, [filter, reservations]);

  // Count per status for the tab badges.
  const statusCounts = useMemo(() => {
    const counts: Record<ReservationStatus | 'all', number> = {
      all: reservations.length,
      draft: 0,
      pendingApproval: 0,
      approved: 0,
      active: 0,
      checkedIn: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
      noShow: 0,
      expired: 0,
    };
    reservations.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [reservations]);

  // Row action menu rendered inside the ThreeDotsActions popover. Visibility
  // mirrors the previous Tooltip+IconButton gating.
  const renderRowActions = ({ popover, row }: { popover: any; row: RoomReservation }) => {
    const close = () => popover.onClose();
    const canEditRow = Boolean(onEdit) && ['draft', 'pendingApproval'].includes(row.status);
    const canApproveRow = canApprove && row.approvalStatus === 'pending';
    const canCancelRow = Boolean(onCancel) && ['active', 'approved', 'pendingApproval'].includes(row.status);
    const actionDisabled = (type: 'approve' | 'reject') =>
      isAnyActionPending && !isBusy(row.id, type);

    return (
      <Box sx={{ py: 0.5 }}>
        {canEditRow && (
          <MenuItem
            onClick={() => {
              close();
              onEdit?.(row);
            }}
          >
            <Iconify icon={GlobalIcons.edit} />
            Edit
          </MenuItem>
        )}

        {canApproveRow && (
          <MenuItem
            disabled={actionDisabled('approve')}
            onClick={() => {
              close();
              setApproveId(row.id);
            }}
          >
            <Iconify icon="mdi:check" color="success.main" />
            Approve
          </MenuItem>
        )}

        {canApproveRow && (
          <MenuItem
            disabled={actionDisabled('reject')}
            onClick={() => {
              close();
              handleOpenReject(row.id);
            }}
          >
            <Iconify icon="mdi:close" color="error.main" />
            Reject
          </MenuItem>
        )}

        {canCancelRow && (
          <MenuItem
            disabled={isAnyActionPending}
            onClick={() => {
              close();
              setCancelId(row.id);
            }}
          >
            <Iconify icon={GlobalIcons.delete} color="error.main" />
            Cancel Reservation
          </MenuItem>
        )}
      </Box>
    );
  };

  const hasAnyRowActions = (row: RoomReservation) =>
    (onEdit && ['draft', 'pendingApproval'].includes(row.status)) ||
    (canApprove && row.approvalStatus === 'pending') ||
    (onCancel && ['active', 'approved', 'pendingApproval'].includes(row.status));

  return (
    <Stack spacing={1} sx={{ height: '100%' }}>
      {/* Status filter — tab bar matching Schedule Exam */}
      <Paper
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v as ReservationStatus | 'all')}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1 }, flexGrow: 1 }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              value={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label color={(tab.color as LabelColor) || 'default'}>
                    {statusCounts[tab.value] || 0}
                  </Label>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      <CustomizableTable
        tableContainerProps={{ sx: { height: '100%' } }}
        tableId="room-reservations-enhanced"
        tableTitle="Room Reservations"
        data={filtered}
        isLoading={isLoading || isCancelling}
        columns={[
          {
            id: 'roomName',
            label: 'Room',
            minWidth: 140,
            sticky: true,
            render: (_v, row) => (
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {row.roomName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.buildingName}
                </Typography>
              </Box>
            ),
          },
          {
            id: 'date',
            label: 'Date Range',
            minWidth: 180,
            filterType: 'date',
            render: (_v, row) => (
              <Box>
                <Typography variant="body2">
                  {row.date ? dayjs(row.date).format('DD-MM-YYYY') : ''}
                  {row.isRecurring &&
                    row.recurringUntilDate &&
                    ` to ${dayjs(row.recurringUntilDate).format('DD-MM-YYYY')}`}
                </Typography>
                {row.isRecurring && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontWeight={600}
                    display="block"
                  >
                    (Recurring)
                  </Typography>
                )}
              </Box>
            ),
          },
          {
            id: 'startTime',
            label: 'Time',
            minWidth: 120,
            render: (_v, row) => `${row.startTime} – ${row.endTime}`,
          },
          {
            id: 'purpose',
            label: 'Purpose',
            minWidth: 200,
            render: (v) => (
              <Typography variant="body2" noWrap sx={{ maxWidth: 190 }}>
                {v}
              </Typography>
            ),
          },
          {
            id: 'reservationType',
            label: 'Type',
            minWidth: 110,
            filterType: 'enum',
            enumOptions: [
              { label: 'Class', value: 'class' },
              { label: 'Exam', value: 'exam' },
              { label: 'Event', value: 'event' },
              { label: 'Maintenance', value: 'maintenance' },
              { label: 'Meeting', value: 'meeting' },
              { label: 'Other', value: 'other' },
            ],
            render: (v) => (
              <Label variant="soft" color="default" sx={{ textTransform: 'capitalize' }}>
                {v}
              </Label>
            ),
          },
          {
            id: 'approvalStatus',
            label: 'Approval',
            minWidth: 120,
            sticky: true,
            stickyPosition: 'right',
            filterType: 'enum',
            enumOptions: [
              { label: 'Approved', value: 'approved' },
              { label: 'Pending', value: 'pending' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Auto Approved', value: 'autoApproved' },
            ],
            render: (_v, row) =>
              row.approvalStatus ? (
                <ApprovalStatusChip status={row.approvalStatus} />
              ) : (
                <Typography variant="body2" color="text.disabled">
                  —
                </Typography>
              ),
          },
          {
            id: 'actions',
            label: 'Actions',
            minWidth: 50,
            width: 50,
            isSort: false,
            isFilter: false,
            sticky: true,
            stickyPosition: 'right',
            render: (_v, row) => {
              const isRequester = currentUserId && row.creatorId && currentUserId === row.creatorId;
              const showApproveActions = canApprove && !isRequester;

              return (
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                  <Tooltip title="View Room Details">
                    <IconButton size="small" color="default" onClick={() => onViewRoom?.(row.roomId)}>
                      <Iconify icon={GlobalIcons.eye} width={18} />
                    </IconButton>
                  </Tooltip>

                  {onEdit && ['draft', 'pendingApproval'].includes(row.status) && (
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(row as RoomReservation)}
                      >
                        <Iconify icon={GlobalIcons.edit} width={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {showApproveActions && row.approvalStatus === 'pending' && (
                    <>
                      <Tooltip title="Approve">
                        <span>
                          <LoadingButton
                            size="small"
                            color="success"
                            variant="text"
                            loading={isBusy(row.id, 'approve')}
                            disabled={isAnyActionPending && !isBusy(row.id, 'approve')}
                            onClick={() => setApproveId(row.id)}
                            sx={{
                              minWidth: 32,
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                            }}
                          >
                            <Iconify icon="mdi:check" width={20} />
                          </LoadingButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isAnyActionPending}
                            onClick={() => handleOpenReject(row.id)}
                          >
                            <Iconify icon="mdi:close" width={20} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </>
                  )}

                  {onCancel && ['active', 'approved', 'pendingApproval'].includes(row.status) && (
                    <Tooltip title="Cancel Reservation">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isAnyActionPending}
                          onClick={() => {
                            setCancelId(row.id);
                          }}
                        >
                          <Iconify icon={GlobalIcons.delete} width={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </Stack>
              );
            },
          },
        ]}
      />

      <ConfirmDialog
        open={!!cancelId}
        onClose={() => {
          if (!isCancelling) setCancelId(null);
        }}
        title="Cancel Reservation"
        content="Are you sure you want to cancel this reservation? This action cannot be undone."
        icon="warning"
        action={
          <LoadingButton
            size="small"
            variant="contained"
            color="error"
            loading={isCancelling}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={handleConfirmCancel}
          >
            Cancel Reservation
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={!!approveId}
        onClose={() => setApproveId(null)}
        title="Approve Reservation"
        content="Are you sure you want to approve this reservation?"
        icon="success"
        action={
          <LoadingButton
            size="small"
            variant="contained"
            color="success"
            loading={approveId ? isBusy(approveId, 'approve') : false}
            onClick={() => {
              if (approveId && onApprove) {
                onApprove(approveId);
              }
              setApproveId(null);
            }}
          >
            Approve
          </LoadingButton>
        }
      />

      <CustomDialog
        open={rejectDialogOpen}
        handleClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        hasForm
        title={
          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            alignItems="center"
            component="span"
            sx={{ fontWeight: 'normal' }}
          >
            <Iconify icon="mdi:close-circle" color="error.main" width={22} height={22} />
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Reject Reservation
            </Box>
            <CustomTooltip
              arrow
              placement="right"
              title="Provide a reason for rejecting this reservation request. The requester will be notified."
            >
              <Iconify
                icon={GlobalIcons.info}
                sx={{ cursor: 'pointer' }}
                color="info.main"
                width={16}
                height={16}
              />
            </CustomTooltip>
          </Box>
        }
      >
        <DialogScrollContent>
          <Stack spacing={2} sx={{ pt: 1, pb: 2 }}>
            <Alert severity="warning">
              The requester will be notified with your rejection reason.
            </Alert>
            <TextField
              size="small"
              label="Rejection Reason *"
              multiline
              rows={3}
              fullWidth
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              error={!!rejectError}
              helperText={rejectError}
              placeholder="e.g. Clashes with existing timetable. Please choose another slot."
            />
          </Stack>
        </DialogScrollContent>

        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <CancelButton onClick={() => setRejectDialogOpen(false)} />
          <LoadingButton
            size="small"
            variant="contained"
            color="error"
            loading={isRejecting}
            startIcon={<Iconify icon={GlobalIcons.delete} width={16} />}
            onClick={handleConfirmReject}
          >
            Confirm Rejection
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Stack>
  );
};
