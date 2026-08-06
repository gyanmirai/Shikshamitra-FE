'use client';

import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  Box,
  Card,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
} from '@mui/material';

import { ApprovalStatusChip } from './RoomStatusChip';

import type { RoomReservation } from '../types';

type PendingAction = { id: string; type: 'approve' | 'reject' } | null;

interface RoomReservationsTabProps {
  reservations: RoomReservation[];
  canApprove?: boolean;
  pendingAction?: PendingAction;
  onCancel?: (id: string) => void;
  onApprove?: (id: string) => Promise<boolean> | void;
  onReject?: (id: string, reason: string) => Promise<boolean> | void;
  onEdit?: (reservation: RoomReservation) => void;
  onViewRoom?: (roomId: string) => void;
}

export const RoomReservationsTab = ({
  reservations,
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
  const [filter, setFilter] = useState<string>('all');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // True only for the specific row + action currently in flight; drives the
  // active button's loading spinner. Sibling/other-row actions are gated by
  // `isAnyActionPending` to prevent concurrent requests.
  const isBusy = (id: string, type: 'approve' | 'reject') =>
    pendingAction?.id === id && pendingAction?.type === type;
  const isAnyActionPending = pendingAction !== null;

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

  const statusFilters = [
    { value: 'all', label: 'All', icon: 'mdi:view-grid-outline', color: 'info.main', bgcolor: 'info.lighter' },
    { value: 'active', label: 'Active', icon: 'mdi:calendar-check', color: 'primary.main', bgcolor: 'primary.lighter' },
    { value: 'pendingApproval', label: 'Pending', icon: 'mdi:clock-outline', color: 'warning.main', bgcolor: 'warning.lighter' },
    { value: 'approved', label: 'Approved', icon: 'mdi:check-decagram-outline', color: 'success.main', bgcolor: 'success.lighter' },
    { value: 'completed', label: 'Completed', icon: 'mdi:flag-checkered', color: 'success.main', bgcolor: 'success.lighter' },
    { value: 'cancelled', label: 'Cancelled', icon: 'mdi:cancel', color: 'error.main', bgcolor: 'error.lighter' },
    { value: 'rejected', label: 'Rejected', icon: 'mdi:close-circle-outline', color: 'error.main', bgcolor: 'error.lighter' },
  ];

  return (
    <Stack spacing={1} sx={{ height: '100%' }}>
      {/* Status filter cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: 'repeat(7, 1fr)',
          },
          mb: 1,
        }}
      >
        {statusFilters.map((sf) => {
          const count = sf.value === 'all' ? reservations.length : reservations.filter((r) => r.status === sf.value).length;
          const isSelected = filter === sf.value;
          
          return (
            <Card
              key={sf.value}
              role="button"
              tabIndex={0}
              onClick={() => setFilter(sf.value)}
              onKeyDown={(event) => event.key === 'Enter' && setFilter(sf.value)}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                border: (theme) =>
                  `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                boxShadow: isSelected ? 4 : 0,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify
                  icon={sf.icon}
                  width={20}
                  sx={{ color: isSelected ? 'primary.main' : 'text.secondary' }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {sf.label}
                  </Typography>
                  <Typography variant="subtitle1" noWrap>
                    {count}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          );
        })}
      </Box>

      <CustomizableTable
        tableContainerProps={{ sx: { height: '100%' } }}
        tableId="room-reservations-enhanced"
        tableTitle="Room Reservations"
        data={filtered}
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
                  {row.date ? dayjs(row.date).format('DD/MM/YYYY') : ''}
                  {row.isRecurring && row.recurringUntilDate && ` to ${dayjs(row.recurringUntilDate).format('DD/MM/YYYY')}`}
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
              <Chip
                size="small"
                label={v}
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
            ),
          },
          {
            id: 'approvalStatus',
            label: 'Approval',
            minWidth: 90,
            sticky: true,
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
            minWidth: 90,
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
        onClose={() => setCancelId(null)}
        title="Cancel Reservation"
        content="Are you sure you want to cancel this reservation? This action cannot be undone."
        icon="warning"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (cancelId && onCancel) {
                onCancel(cancelId);
              }
              setCancelId(null);
            }}
          >
            Cancel
          </Button>
        }
      />

      <ConfirmDialog
        open={!!approveId}
        onClose={() => setApproveId(null)}
        title="Approve Reservation"
        content="Are you sure you want to approve this reservation?"
        icon="success"
        action={
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (approveId && onApprove) {
                onApprove(approveId);
              }
              setApproveId(null);
            }}
          >
            Approve
          </Button>
        }
      />

      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:close" width={22} color="error.main" />
            <Typography variant="h6">Reject Reservation</Typography>
            <Tooltip title="Provide a reason for rejecting this reservation request. The requester will be notified.">
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" width={20} />
              </Box>
            </Tooltip>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled={isRejecting}
            startIcon={<Iconify icon={GlobalIcons.cancel} width={16} />}
            onClick={() => setRejectDialogOpen(false)}
          >
            Cancel
          </Button>
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
      </Dialog>
    </Stack>
  );
};
