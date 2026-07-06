'use client';

import { useMemo, useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Stack,
  Drawer,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  InputAdornment,
} from '@mui/material';

import { useRoomAuditLogs } from '../roomAvailability.hooks';
import { RoomAuditLogPanel } from './RoomAuditLogPanel';

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

  const { data, isLoading, error, fetch } = useRoomAuditLogs(
    selectedRoomId === 'all' ? null : selectedRoomId
  );

  useEffect(() => {
    if (open) {
      setSelectedRoomId(initialRoomId || 'all');
      setSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialRoomId]);

  useEffect(() => {
    if (open) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedRoomId]);

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

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: { sm: 16 },
          borderBottomLeftRadius: { sm: 16 },
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            <Iconify icon="mdi:history" width={22} sx={{ color: 'common.white' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Room Audit Trail
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Every reservation, approval and maintenance action across all rooms
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </Stack>

      {/* Filters */}
      <Stack spacing={1.5} sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}>
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
            <TextField
              {...params}
              label="Room"
              placeholder="Search building, floor, or room…"
            />
          )}
        />

        <TextField
          size="small"
          fullWidth
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
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2, bgcolor: 'background.neutral' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {isLoading ? 'Loading…' : `${filteredLogs.length} of ${data.length} entries`}
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
          }}
        >
          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : (
            <RoomAuditLogPanel logs={filteredLogs} showRoomChip={selectedRoomId === 'all'} />
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Divider />
      <Stack direction="row" justifyContent="flex-end" sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ borderRadius: 1.5, px: 3 }}>
          Close
        </Button>
      </Stack>
    </Drawer>
  );
};
