'use client';

import { useMemo, useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Chip,
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

  const { data, isLoading, isFetching, error, fetch } = useRoomAuditLogs(
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
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            <Iconify icon="mdi:history" width={24} sx={{ color: 'common.white' }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                Room Audit Trail
              </Typography>
              <CustomTooltip
                title="Track full history of room reservations, maintenance blocks, and approval status changes."
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
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Every reservation, approval and maintenance action across all rooms
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ p: 0.5, color: 'text.secondary' }}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>

      {/* Filters */}
      <Stack spacing={2} sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: 'divider' }}>
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
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2.5, bgcolor: 'background.neutral' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {isDataLoading ? 'Loading logs…' : `${filteredLogs.length} of ${data.length} entries`}
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
          {isDataLoading ? (
            <Stack spacing={1.5}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 1.5 }} />
              ))}
            </Stack>
          ) : error ? (
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
      <Stack direction="row" justifyContent="flex-end" sx={{ p: 2.5, bgcolor: 'background.paper' }}>
        <Button
          variant="outlined"
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
