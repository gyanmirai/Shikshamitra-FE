'use client';

import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Tooltip, IconButton, Typography } from '@mui/material';

import { ApprovalStatusChip } from './RoomStatusChip';

import type { RoomReservation } from '../types';

type PendingAction = { id: string; type: 'approve' | 'reject' } | null;

interface RoomReservationsTabProps {
  reservations: RoomReservation[];
  canApprove?: boolean;
  pendingAction?: PendingAction;
  onCancel?: (id: string) => void;
  onApprove?: (id: string) => Promise<boolean> | void;
  onReject?: (id: string) => Promise<boolean> | void;
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
  const [filter, setFilter] = useState<string>('all');

  // True only for the specific row + action currently in flight; drives the
  // active button's loading spinner. Sibling/other-row actions are gated by
  // `isAnyActionPending` to prevent concurrent requests.
  const isBusy = (id: string, type: 'approve' | 'reject') =>
    pendingAction?.id === id && pendingAction?.type === type;
  const isAnyActionPending = pendingAction !== null;

  const filtered = useMemo(() => {
    if (filter === 'all') return reservations;
    return reservations.filter((r) => r.status === filter);
  }, [filter, reservations]);

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'pendingApproval', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <Stack spacing={1} sx={{ height: '100%' }}>
      {/* Status filter chips */}
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {statusFilters.map((sf) => (
          <Chip
            key={sf.value}
            size="small"
            label={`${sf.label} (${sf.value === 'all' ? reservations.length : reservations.filter((r) => r.status === sf.value).length})`}
            onClick={() => setFilter(sf.value)}
            variant={filter === sf.value ? 'filled' : 'outlined'}
            color={filter === sf.value ? 'primary' : 'default'}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>

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
                  {row.date}
                  {row.isRecurring && row.recurringUntilDate && ` to ${row.recurringUntilDate}`}
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
            render: (_v, row) => (
              <Stack direction="row" spacing={1} justifyContent="center">
                <Tooltip title="View Room Details">
                  <IconButton
                    size="small"
                    onClick={() => onViewRoom?.(row.roomId)}
                    sx={{
                      bgcolor: 'action.selected',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Iconify icon={GlobalIcons.eye} width={16} />
                  </IconButton>
                </Tooltip>

                {onEdit && ['draft', 'pendingApproval'].includes(row.status) && (
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(row as RoomReservation)}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16) },
                      }}
                    >
                      <Iconify icon={GlobalIcons.edit} width={16} />
                    </IconButton>
                  </Tooltip>
                )}

                {canApprove && row.approvalStatus === 'pending' && (
                  <>
                    <Tooltip title="Approve">
                      <span>
                        <LoadingButton
                          size="small"
                          color="success"
                          variant="text"
                          loading={isBusy(row.id, 'approve')}
                          disabled={isAnyActionPending && !isBusy(row.id, 'approve')}
                          onClick={() => onApprove?.(row.id)}
                          sx={{
                            minWidth: 32,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.success.main, 0.16),
                            },
                          }}
                        >
                          <Iconify icon="mdi:check-circle" width={16} />
                        </LoadingButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isAnyActionPending}
                          onClick={() => onReject?.(row.id)}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                            '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.16) },
                          }}
                        >
                          <Iconify icon="mdi:close-circle" width={16} />
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
                          onCancel(row.id);
                        }}
                        sx={{
                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                          '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.16) },
                        }}
                      >
                        <Iconify icon={GlobalIcons.cancel} width={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            ),
          },
        ]}
      />
    </Stack>
  );
};
