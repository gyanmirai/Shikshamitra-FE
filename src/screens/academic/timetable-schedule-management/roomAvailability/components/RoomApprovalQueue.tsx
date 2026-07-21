'use client';

import { useState } from 'react';
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
} from '@mui/material';

import { ApprovalStatusChip, ConflictSeverityChip } from './RoomStatusChip';

import type { RoomReservation } from '../types';

interface RoomApprovalQueueProps {
  reservations: RoomReservation[];
  onApprove?: (id: string, remarks?: string) => void;
  onReject?: (id: string, reason: string) => void;
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

  const handleOpenReject = (id: string) => {
    setRejectTargetId(id);
    setRejectReason('');
    setRejectError('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is mandatory.');
      return;
    }
    onReject?.(rejectTargetId, rejectReason);
    shikshaMitraToast.info({ message: 'Reservation rejected.' });
    setRejectDialogOpen(false);
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
      <Stack spacing={1}>
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
              render: (v) => <Box sx={{ textTransform: 'capitalize', fontSize: 13 }}>{v}</Box>,
            },
            {
              id: 'conflictStatus',
              label: 'Conflict',
              minWidth: 120,
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
              id: 'approvalStatus',
              label: 'Status',
              minWidth: 120,
              render: (_v, row) =>
                row.approvalStatus ? <ApprovalStatusChip status={row.approvalStatus} /> : null,
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
              id: 'actions',
              label: 'Actions',
              minWidth: 180,
              isSort: false,
              isFilter: false,
              sticky: true,
              stickyPosition: 'right',
              render: (_v, row) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<Iconify icon="mdi:check" width={14} />}
                    onClick={() => {
                      onApprove?.(row.id);
                      shikshaMitraToast.success({
                        message: `${row.roomName} reservation approved.`,
                      });
                    }}
                    sx={{ fontSize: 11 }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Iconify icon="mdi:close" width={14} />}
                    onClick={() => handleOpenReject(row.id)}
                    sx={{ fontSize: 11 }}
                  >
                    Reject
                  </Button>
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:close-circle" width={22} color="error.main" />
            <Typography variant="h6">Reject Reservation</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Alert severity="warning">
              The requester will be notified with your rejection reason.
            </Alert>
            <TextField
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
          <Button variant="outlined" color="inherit" onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmReject}>
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
