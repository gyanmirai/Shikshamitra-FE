'use client';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Alert,
  Stack,
  Button,
  Dialog,
  Divider,
  Tooltip,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';

import { ApprovalStatusChip, ConflictSeverityChip } from './RoomStatusChip';

import type { RoomReservation } from '../types';

interface RoomApprovalQueueProps {
  reservations: RoomReservation[];
  onApprove?: (id: string, remarks?: string) => void | Promise<void>;
  onReject?: (id: string, reason: string) => void | Promise<void>;
}

export const RoomApprovalQueue = ({
  reservations,
  onApprove,
  onReject,
}: RoomApprovalQueueProps) => {
  const pending = reservations.filter((r) => r.approvalStatus === 'pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

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
      await onReject?.(rejectTargetId, rejectReason);
      shikshaMitraToast.info({ message: 'Reservation rejected.' });
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

  return (
    <>
      <Stack spacing={1} sx={{ height: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:clock-outline" width={20} color="warning.main" />
          <Typography variant="h6">Approval Queue</Typography>
          <Box
            sx={{
              px: 1,
              borderRadius: 10,
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {pending.length}
          </Box>
        </Stack>

        <CustomizableTable
          tableContainerProps={{ sx: { height: '100%' } }}
          tableId="room-approval-queue"
          tableTitle="Pending Approvals"
          data={pending}
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
                    {row.date}
                    {row.isRecurring && row.recurringUntilDate && ` to ${row.recurringUntilDate}`}
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
              render: (v) => <Box sx={{ textTransform: 'capitalize', fontSize: 13 }}>{v}</Box>,
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
                  {v || '—'}
                </Typography>
              ),
            },
            {
              id: 'approvalStatus',
              label: 'Status',
              minWidth: 80,
              filterType: 'enum',
              sticky: true,
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
              minWidth: 180,
              isSort: false,
              isFilter: false,
              sticky: true,
              stickyPosition: 'right',
              render: (_v, row) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Tooltip title="Approve">
                    <IconButton
                      size="small"
                      color="success"
                      disabled={approvingId !== null || isRejecting}
                      onClick={async () => {
                        setApprovingId(row.id);
                        try {
                          await onApprove?.(row.id);
                          shikshaMitraToast.success({
                            message: `${row.roomName} reservation approved.`,
                          });
                        } finally {
                          setApprovingId(null);
                        }
                      }}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.success.main, 0.16),
                        },
                      }}
                    >
                      {approvingId === row.id ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Iconify icon="mdi:check-circle" width={16} />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      size="small"
                      color="error"
                      disabled={approvingId !== null || isRejecting}
                      onClick={() => handleOpenReject(row.id)}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                        '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.16) },
                      }}
                    >
                      <Iconify icon="mdi:close-circle" width={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ),
            },
          ]}
        />
      </Stack>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:close-circle" width={22} color="error.main" />
              <Typography variant="h6">Reject Reservation</Typography>
            </Stack>
            <Tooltip title="Provide a reason for rejecting this reservation request. The requester will be notified.">
              <IconButton size="small">
                <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
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
            startIcon={<Iconify icon={GlobalIcons.cancel} width={16} />}
            onClick={() => setRejectDialogOpen(false)}
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} width={16} />}
            loading={isRejecting}
            onClick={handleConfirmReject}
          >
            Confirm Rejection
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
