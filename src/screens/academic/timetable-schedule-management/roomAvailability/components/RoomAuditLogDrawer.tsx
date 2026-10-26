'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { FormSectionHeader } from 'src/components/form-section-card';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  Skeleton,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  InputAdornment,
} from '@mui/material';

import { RoomAuditLogPanel } from './RoomAuditLogPanel';
import { useRoomAuditLogs } from '../roomAvailability.hooks';

import type { RoomAvailabilityItem } from '../types';

interface RoomAuditLogDrawerProps {
  open: boolean;
  onClose: () => void;
  rooms: RoomAvailabilityItem[];
  initialRoomId?: string | null;
}

interface RoomOption {
  roomId: string;
  label: string;
}

const ALL_ROOMS_OPTION: RoomOption = { roomId: 'all', label: 'All Rooms' };

export const RoomAuditLogDrawer = ({
  open,
  onClose,
  rooms,
  initialRoomId,
}: RoomAuditLogDrawerProps) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useRoomAuditLogs(
    selectedRoomId === 'all' ? null : selectedRoomId,
    { skip: !open }
  );

  useEffect(() => {
    if (open) {
      setSelectedRoomId(initialRoomId || 'all');
      setSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialRoomId]);

  const roomOptions = useMemo<RoomOption[]>(
    () => [
      ALL_ROOMS_OPTION,
      ...rooms.map((r) => ({
        roomId: r.roomId,
        label: [r.buildingName, r.floorName, r.roomName].filter(Boolean).join(' · '),
      })),
    ],
    [rooms]
  );

  const selectedRoomOption =
    roomOptions.find((o) => o.roomId === selectedRoomId) || ALL_ROOMS_OPTION;

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (log) =>
        log.action.toLowerCase().includes(term) ||
        log.user.toLowerCase().includes(term) ||
        (log.roomName || '').toLowerCase().includes(term) ||
        (log.remarks || '').toLowerCase().includes(term) ||
        (log.newValue || '').toLowerCase().includes(term)
    );
  }, [data, search]);

  const isDataLoading = isLoading || isFetching;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.44)',
            backdropFilter: 'blur(3px)',
          },
        },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-label': 'Room Audit Log',
        sx: {
          width: { xs: '100%', sm: 540 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <FormSectionHeader
          title="Room Audit Trail"
          icon={GlobalIcons.history}
          titleTypographyProps={{ variant: 'h6' }}
          descriptionTooltip="Review room reservation, maintenance and approval changes for the selected room scope."
          action={
            <IconButton aria-label="Close room audit log" onClick={onClose}>
              <Iconify icon={GlobalIcons.cancel} />
            </IconButton>
          }
        />
      </Box>

      {/* Filters */}
      <Stack
        spacing={2}
        sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Autocomplete
          size="small"
          options={roomOptions}
          value={selectedRoomOption}
          isOptionEqualToValue={(option, value) => option.roomId === value.roomId}
          getOptionLabel={(option) => option.label}
          onChange={(_, value) => setSelectedRoomId(value?.roomId || 'all')}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.roomId}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon={option.roomId === 'all' ? 'mdi:door-open' : 'mdi:door'}
                  width={16}
                  color="text.secondary"
                />
                <Typography variant="body2">{option.label}</Typography>
              </Stack>
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Room" placeholder="Search building, floor, or room…" />
          )}
        />

        <TextField
          size="small"
          fullWidth
          label="Search audit logs"
          placeholder="Search by action, user, or remarks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:magnify" width={18} color="text.disabled" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: 'background.neutral',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2, flexShrink: 0 }}
        >
          <Typography variant="caption" color="text.secondary">
            {isDataLoading
              ? 'Loading logs…'
              : error
                ? 'Audit logs unavailable'
                : `${filteredLogs.length} of ${data.length} entries`}
          </Typography>
          {(selectedRoomId !== 'all' || search) && (
            <Chip
              size="small"
              label="Clear filters"
              onDelete={() => {
                setSelectedRoomId('all');
                setSearch('');
              }}
              onClick={() => {
                setSelectedRoomId('all');
                setSearch('');
              }}
              variant="outlined"
              sx={{ fontSize: 11 }}
            />
          )}
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            flex: filteredLogs.length === 0 ? '1 0 auto' : '0 0 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isDataLoading ? (
            <Stack spacing={1.5} aria-busy="true" aria-label="Loading room audit logs">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 1.5 }} />
              ))}
            </Stack>
          ) : error ? (
            <Alert
              severity="error"
              action={
                <Button
                  type="button"
                  size="small"
                  color="inherit"
                  onClick={() => refetch()}
                  startIcon={<Iconify icon={GlobalIcons.refresh} />}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          ) : (
            <RoomAuditLogPanel
              logs={filteredLogs}
              showRoomChip={selectedRoomId === 'all'}
              emptyMessage={
                search.trim()
                  ? 'No audit entries match your search'
                  : 'No audit trail entries found'
              }
            />
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{ px: { xs: 2, sm: 3 }, py: 1.75, flexShrink: 0, bgcolor: 'background.paper' }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </Stack>
    </Drawer>
  );
};
