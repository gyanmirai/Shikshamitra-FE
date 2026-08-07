'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { Box, IconButton } from '@mui/material';
import { MenuItem } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CancelButton from 'src/components/cancel-button';

import { ApprovalStatusChip, ConflictSeverityChip } from './RoomStatusChip';

import type { RoomReservation } from '../types';

type PendingAction = { id: string; type: 'approve' | 'reject' } | null;

interface RoomApprovalQueueProps {
  reservations: RoomReservation[];
  isLoading?: boolean;
  pendingAction?: PendingAction;
  onApprove?: (id: string, remarks?: string) => Promise<boolean> | void;
  onReject?: (id: string, reason: string) => Promise<boolean> | void;
}

export const RoomApprovalQueue = ({
  reservations,
  isLoading = false,
  pendingAction,
  onApprove,
  onReject,
}: RoomApprovalQueueProps) => {
  const { data: session } = useSession() as any;
  const currentUserId = session?.profile?.sub;
  const pending = reservations.filter((r) => r.approvalStatus === 'pending');
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // True only for the specific row + action currently in flight; drives the
  // active action's loading spinner. Sibling/other-row buttons are gated by
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

  if (pending.length === 0) {
    return (
      <Alert severity="success" icon={<Iconify icon="mdi:check-circle" />}>
        No pending approval requests. All reservations have been processed.
      </Alert>
    );
  }

  // Row action menu rendered inside the ThreeDotsActions popover.
  const renderRowActions = ({ popover, row }: { popover: any; row: RoomReservation }) => {
    const close = () => popover.onClose();
    const actionDisabled = (type: 'approve' | 'reject') =>
      isAnyActionPending && !isBusy(row.id, type);

    return (
      <Box sx={{ py: 0.5 }}>
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
      </Box>
    );
  };

  return (
    <>
      <Stack spacing={1} sx={{ height: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:clock-outline" width={20} color="warning.main" />
          <Typography variant="h6" fontWeight={700}>
            Approval Queue
          </Typography>
          <CustomTooltip
            title="Review and process pending room reservation requests requiring administrator approval."
            arrow
            placement="right"
          >
            <Iconify
              icon={GlobalIcons.info}
              color="info.main"
              width={18}
              height={18}
              sx={{ cursor: 'pointer', mt: 0.25 }}
            />
          </CustomTooltip>
          <Label color="warning">{pending.length}</Label>
        </Stack>

        <CustomizableTable
          tableContainerProps={{ sx: { height: '100%' } }}
          tableId="room-approval-queue"
          tableTitle="Pending Approvals"
          data={pending}
          isLoading={isLoading}
          columns={[
            {
              id: 'requestedBy',
              label: 'Requested By',
              minWidth: 140,
              render: (v) => v || '—',
            },
            {
              id: 'roomName',
              label: 'Room',
              minWidth: 140,
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
              id: 'date',
              label: 'Date / Time',
              minWidth: 180,
              render: (_v, row) => (
                <Box>
                  <Typography variant="body2">
                    {row.date ? dayjs(row.date).format('DD-MM-YYYY') : ''}
                    {row.isRecurring &&
                      row.recurringUntilDate &&
                      ` to ${dayjs(row.recurringUntilDate).format('DD-MM-YYYY')}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {row.startTime} – {row.endTime}
                    {row.isRecurring && ' (Recurring)'}
                  </Typography>
                </Box>
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
                <Box sx={{ textTransform: 'capitalize', fontSize: 13 }}>{v}</Box>
              ),
            },
            {
              id: 'conflictStatus',
              label: 'Conflict',
              minWidth: 120,
              filterType: 'enum',
              enumOptions: [
                { label: 'None', value: 'none' },
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Critical', value: 'critical' },
              ],
              render: (_v, row) =>
                row.conflictStatus && row.conflictStatus !== 'none' ? (
                  <Tooltip title={row.conflictReason || ''} arrow>
                    <ConflictSeverityChip severity={row.conflictStatus as any} />
                  </Tooltip>
                ) : (
                  <Typography variant="caption" color="success.main">
                    None
                  </Typography>
                ),
            },
            {
              id: 'createdAt',
              label: 'Requested On',
              minWidth: 120,
              render: (v) => (
                <Typography variant="caption" color="text.secondary">
                  {v ? dayjs(v).format('DD-MM-YYYY, hh:mm A') : '—'}
                </Typography>
              ),
            },
            {
              id: 'approvalStatus',
              label: 'Status',
              minWidth: 120,
              filterType: 'enum',
              sticky: true,
              stickyPosition: 'right',
              enumOptions: [
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
                { label: 'Auto Approved', value: 'autoApproved' },
              ],
              render: (_v, row) =>
                row.approvalStatus ? <ApprovalStatusChip status={row.approvalStatus} /> : null,
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
                if (isRequester) {
                  return <Typography variant="caption" color="text.disabled">—</Typography>;
                }
                return (
                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
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
                  </Stack>
                );
              },
            },
          ]}
        />
      </Stack>

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
    </>
  );
};
