'use client';

import { useMemo, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Tooltip, IconButton, Typography } from '@mui/material';

import { ApprovalStatusChip, ReservationStatusChip } from './RoomStatusChip';

import type { RoomReservation } from '../types';

interface RoomReservationsTabProps {
  reservations: RoomReservation[];
  canApprove?: boolean;
  onCancel?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (reservation: RoomReservation) => void;
}

export const RoomReservationsTab = ({
  reservations,
  canApprove = false,
  onCancel,
  onApprove,
  onReject,
  onEdit,
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
          { id: 'date', label: 'Date', filterType: 'date', minWidth: 110 },
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
            id: 'reservedFor',
            label: 'Reserved For',
            minWidth: 130,
            render: (v) => v || '—',
          },
          {
            id: 'requestedBy',
            label: 'Requested By',
            minWidth: 140,
            render: (v) => v || '—',
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: 140,
            render: (_v, row) => <ReservationStatusChip status={row.status} />,
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
            id: 'conflictStatus',
            label: 'Conflict',
            minWidth: 110,
            render: (_v, row) =>
              row.conflictStatus && row.conflictStatus !== 'none' ? (
                <Tooltip title={row.conflictReason || ''} arrow>
                  <Chip
                    size="small"
                    label={row.conflictStatus}
                    color={row.conflictStatus === 'critical' ? 'error' : 'warning'}
                    variant="soft"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Tooltip>
              ) : (
                <Chip size="small" label="None" color="success" variant="soft" />
              ),
          },
          {
            id: 'actions',
            label: 'Actions',
            minWidth: 150,
            isSort: false,
            isFilter: false,
            sticky: true,
            stickyPosition: 'right',
            render: (_v, row) => (
              <Stack direction="row" spacing={0.25} justifyContent="center">
                <Tooltip title="View Details">
                  <IconButton size="small">
                    <Iconify icon={GlobalIcons.eye} width={17} />
                  </IconButton>
                </Tooltip>

                {onEdit && ['draft', 'pendingApproval'].includes(row.status) && (
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(row)}>
                      <Iconify icon={GlobalIcons.edit} width={17} />
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
                      >
                        <Iconify icon="mdi:check-circle" width={17} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton size="small" color="error" onClick={() => onReject?.(row.id)}>
                        <Iconify icon="mdi:close-circle" width={17} />
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
                    >
                      <Iconify icon={GlobalIcons.cancel} width={17} />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Duplicate">
                  <IconButton size="small">
                    <Iconify icon="mdi:content-copy" width={17} />
                  </IconButton>
                </Tooltip>
              </Stack>
            ),
          },
        ]}
      />
    </Stack>
  );
};
