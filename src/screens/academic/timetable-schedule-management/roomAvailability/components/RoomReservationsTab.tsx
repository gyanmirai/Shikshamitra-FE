'use client';

import { useMemo, useState } from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Tooltip, IconButton, Typography } from '@mui/material';

import { ApprovalStatusChip } from './RoomStatusChip';

import type { RoomReservation } from '../types';

interface RoomReservationsTabProps {
  reservations: RoomReservation[];
  canApprove?: boolean;
  onCancel?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (reservation: RoomReservation) => void;
  onViewRoom?: (roomId: string) => void;
}

export const RoomReservationsTab = ({
  reservations,
  canApprove = false,
  onCancel,
  onApprove,
  onReject,
  onEdit,
  onViewRoom,
}: RoomReservationsTabProps) => {
  const [filter, setFilter] = useState<string>('all');

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
    <Stack spacing={1.5}>
      {/* Status filter chips */}
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
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
            minWidth: 130,
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
            minWidth: 120,
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
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => {
                          onApprove?.(row.id);
                          shikshaMitraToast.success({
                            message: `${row.roomName} reservation approved.`,
                          });
                        }}
                        sx={{
                          bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                          '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.16),
                          },
                        }}
                      >
                        <Iconify icon="mdi:check-circle" width={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onReject?.(row.id)}
                        sx={{
                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                          '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.16) },
                        }}
                      >
                        <Iconify icon="mdi:close-circle" width={16} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}

                {onCancel && ['active', 'approved', 'pendingApproval'].includes(row.status) && (
                  <Tooltip title="Cancel Reservation">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        onCancel(row.id);
                        shikshaMitraToast.info({ message: 'Reservation cancelled.' });
                      }}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                        '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.16) },
                      }}
                    >
                      <Iconify icon={GlobalIcons.cancel} width={16} />
                    </IconButton>
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
