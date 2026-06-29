'use client';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  Box,
  Chip,
  Stack,
  Button,
  Switch,
  Select,
  Divider,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  ListItemText,
  OutlinedInput,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import {
  SOURCE_OPTIONS,
  BUILDING_OPTIONS,
  CAPACITY_OPTIONS,
  FACILITY_OPTIONS,
  ROOM_TYPE_OPTIONS,
  LECTURE_SLOT_OPTIONS,
  STATUS_FILTER_OPTIONS,
  CONFLICT_FILTER_OPTIONS,
  DEFAULT_ROOM_AVAILABILITY_FILTERS,
} from '../roomAvailability.constants';

import type { RoomFacility, RoomAvailabilityFilters as Filters } from '../types';

// Helper function to determine active filters
export const getActiveFilters = (currentFilters: Filters) => {
  const active: { key: keyof Filters; label: string; value: any }[] = [];

  // Date
  if (currentFilters.date !== DEFAULT_ROOM_AVAILABILITY_FILTERS.date) {
    const displayDate =
      currentFilters.date === 'today' ? 'Today' : dayjs(currentFilters.date).format('DD/MM/YYYY');
    active.push({
      key: 'date',
      label: `Date: ${displayDate}`,
      value: currentFilters.date,
    });
  }

  // Lecture Slot
  if (currentFilters.lectureSlot !== DEFAULT_ROOM_AVAILABILITY_FILTERS.lectureSlot) {
    const option = LECTURE_SLOT_OPTIONS.find((o) => o.value === currentFilters.lectureSlot);
    active.push({
      key: 'lectureSlot',
      label: `Slot: ${option ? option.label : currentFilters.lectureSlot}`,
      value: currentFilters.lectureSlot,
    });
  }

  // Building
  if (currentFilters.building !== DEFAULT_ROOM_AVAILABILITY_FILTERS.building) {
    const option = BUILDING_OPTIONS.find((o) => o.value === currentFilters.building);
    active.push({
      key: 'building',
      label: `Building: ${option ? option.label : currentFilters.building}`,
      value: currentFilters.building,
    });
  }

  // Room Type
  if (currentFilters.roomType !== DEFAULT_ROOM_AVAILABILITY_FILTERS.roomType) {
    const option = ROOM_TYPE_OPTIONS.find((o) => o.value === currentFilters.roomType);
    active.push({
      key: 'roomType',
      label: `Type: ${option ? option.label : currentFilters.roomType}`,
      value: currentFilters.roomType,
    });
  }

  // Min Capacity
  if (currentFilters.minimumCapacity !== DEFAULT_ROOM_AVAILABILITY_FILTERS.minimumCapacity) {
    const option = CAPACITY_OPTIONS.find((o) => o.value === currentFilters.minimumCapacity);
    active.push({
      key: 'minimumCapacity',
      label: `Capacity: ${option ? option.label : `${currentFilters.minimumCapacity}+ seats`}`,
      value: currentFilters.minimumCapacity,
    });
  }

  // Search Room
  if (currentFilters.search !== DEFAULT_ROOM_AVAILABILITY_FILTERS.search) {
    active.push({
      key: 'search',
      label: `Search: "${currentFilters.search}"`,
      value: currentFilters.search,
    });
  }

  // Include Occupied (default is true, active if false)
  if (currentFilters.includeOccupied !== DEFAULT_ROOM_AVAILABILITY_FILTERS.includeOccupied) {
    active.push({
      key: 'includeOccupied',
      label: 'Exclude Occupied',
      value: currentFilters.includeOccupied,
    });
  }

  // Only Available (default is false, active if true)
  if (currentFilters.onlyAvailable !== DEFAULT_ROOM_AVAILABILITY_FILTERS.onlyAvailable) {
    active.push({
      key: 'onlyAvailable',
      label: 'Only Available',
      value: currentFilters.onlyAvailable,
    });
  }

  // Status
  if (currentFilters.status !== DEFAULT_ROOM_AVAILABILITY_FILTERS.status) {
    const option = STATUS_FILTER_OPTIONS.find((o) => o.value === currentFilters.status);
    active.push({
      key: 'status',
      label: `Status: ${option ? option.label : currentFilters.status}`,
      value: currentFilters.status,
    });
  }

  // Source
  if (currentFilters.source !== DEFAULT_ROOM_AVAILABILITY_FILTERS.source) {
    const option = SOURCE_OPTIONS.find((o) => o.value === currentFilters.source);
    active.push({
      key: 'source',
      label: `Source: ${option ? option.label : currentFilters.source}`,
      value: currentFilters.source,
    });
  }

  // Conflict Severity
  if (currentFilters.conflictSeverity !== DEFAULT_ROOM_AVAILABILITY_FILTERS.conflictSeverity) {
    const option = CONFLICT_FILTER_OPTIONS.find((o) => o.value === currentFilters.conflictSeverity);
    active.push({
      key: 'conflictSeverity',
      label: `Conflicts: ${option ? option.label : currentFilters.conflictSeverity}`,
      value: currentFilters.conflictSeverity,
    });
  }

  // Facilities
  if (currentFilters.facilities.length > 0) {
    const labels = currentFilters.facilities
      .map((f) => FACILITY_OPTIONS.find((o) => o.value === f)?.label || f)
      .join(', ');
    active.push({
      key: 'facilities',
      label: `Facilities: ${labels}`,
      value: currentFilters.facilities,
    });
  }

  // Start Time
  if (currentFilters.startTime) {
    active.push({
      key: 'startTime',
      label: `Start: ${currentFilters.startTime}`,
      value: currentFilters.startTime,
    });
  }

  // End Time
  if (currentFilters.endTime) {
    active.push({
      key: 'endTime',
      label: `End: ${currentFilters.endTime}`,
      value: currentFilters.endTime,
    });
  }

  return active;
};

interface RoomAvailabilityFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export const RoomAvailabilityFilters = ({
  filters,
  onChange,
  onReset,
}: RoomAvailabilityFiltersProps) => {
  const popover = usePopover();
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);

  // Sync draft filters when the popover opens
  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setDraftFilters(filters);
      popover.onOpen(event);
    },
    [filters, popover]
  );

  const handleDraftChange = useCallback((patch: Partial<Filters>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onChange(draftFilters);
    popover.onClose();
  }, [draftFilters, onChange, popover]);

  const handleResetDraftFilters = useCallback(() => {
    setDraftFilters(DEFAULT_ROOM_AVAILABILITY_FILTERS);
  }, []);

  const activeFiltersCount = getActiveFilters(filters).length;

  return (
    <>
      <Button
        variant="outlined"
        color={activeFiltersCount > 0 ? 'primary' : 'inherit'}
        onClick={handleOpenPopover}
        startIcon={<Iconify icon="mdi:tune" width={16} />}
        size="small"
        sx={{
          borderRadius: 1,
          height: 32,
          fontWeight: 'fontWeightMedium',
        }}
      >
        Filters
        {activeFiltersCount > 0 && (
          <Chip
            size="small"
            label={activeFiltersCount}
            color="primary"
            sx={{
              ml: 0.75,
              height: 18,
              fontSize: 10,
              fontWeight: 'bold',
            }}
          />
        )}
      </Button>

      {/* ── Filters Popover ────────────────────────────────── */}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: {
            sx: {
              p: 2.5,
              width: 560,
              maxWidth: '95vw',
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'fontWeightSemiBold' }}>
            Filter Rooms
          </Typography>
          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={handleResetDraftFilters}
            startIcon={<Iconify icon="mdi:refresh" width={14} />}
            sx={{ color: 'text.secondary', typography: 'caption' }}
          >
            Reset defaults
          </Button>
        </Stack>

        <Stack spacing={2} sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5, mb: 3 }}>
          {/* Section 0: Search Room */}
          <TextField
            size="small"
            label="Search Room"
            placeholder="Room name, building..."
            value={draftFilters.search}
            onChange={(e) => handleDraftChange({ search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mdi:magnify" width={18} />
                </InputAdornment>
              ),
              endAdornment: draftFilters.search ? (
                <InputAdornment position="end">
                  <Iconify
                    icon="mdi:close"
                    width={16}
                    onClick={() => handleDraftChange({ search: '' })}
                    sx={{ cursor: 'pointer', color: 'text.secondary' }}
                  />
                </InputAdornment>
              ) : null,
            }}
            fullWidth
          />

          <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

          {/* Section 1: Location & Schedule */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Location & Schedule
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <DatePicker
              label="Date"
              value={draftFilters.date === 'today' ? dayjs() : dayjs(draftFilters.date)}
              onChange={(value) => {
                if (value) handleDraftChange({ date: value.format('YYYY-MM-DD') });
              }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <CustomSelect
              label="Lecture Slot"
              options={LECTURE_SLOT_OPTIONS}
              value={draftFilters.lectureSlot}
              onChange={(v) => handleDraftChange({ lectureSlot: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Building"
              options={BUILDING_OPTIONS}
              value={draftFilters.building}
              onChange={(v) => handleDraftChange({ building: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Room Type"
              options={ROOM_TYPE_OPTIONS}
              value={draftFilters.roomType}
              onChange={(v) => handleDraftChange({ roomType: v as string })}
              formControlProps={{ fullWidth: true }}
            />
          </Box>

          <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

          {/* Section 2: Specifications & Time */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Specifications & Availability
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <CustomSelect
              label="Min Capacity"
              options={CAPACITY_OPTIONS}
              value={draftFilters.minimumCapacity}
              onChange={(v) => handleDraftChange({ minimumCapacity: v as number })}
              formControlProps={{ fullWidth: true }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Facilities</InputLabel>
              <Select
                multiple
                value={draftFilters.facilities}
                onChange={(e) => {
                  const value = e.target.value as RoomFacility[];
                  handleDraftChange({ facilities: value });
                }}
                input={<OutlinedInput label="Facilities" />}
                renderValue={(selected) =>
                  (selected as RoomFacility[])
                    .slice(0, 2)
                    .map((f) => FACILITY_OPTIONS.find((o) => o.value === f)?.label || f)
                    .join(', ') + (selected.length > 2 ? ` +${selected.length - 2}` : '')
                }
              >
                {FACILITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} dense>
                    <Checkbox
                      checked={draftFilters.facilities.includes(opt.value as RoomFacility)}
                      size="small"
                    />
                    <ListItemText primary={opt.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="Start Time"
                type="time"
                value={draftFilters.startTime || ''}
                onChange={(e) => handleDraftChange({ startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                size="small"
                label="End Time"
                type="time"
                value={draftFilters.endTime || ''}
                onChange={(e) => handleDraftChange({ endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 0.5 }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={draftFilters.includeOccupied}
                    onChange={(e) => handleDraftChange({ includeOccupied: e.target.checked })}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                    Include Occupied
                  </Typography>
                }
                sx={{ m: 0 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={draftFilters.onlyAvailable}
                    onChange={(e) => handleDraftChange({ onlyAvailable: e.target.checked })}
                    color="success"
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                    Only Available
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Stack>
          </Box>

          <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

          {/* Section 3: Status & Conflict */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Status & Conflict
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
            <CustomSelect
              label="Status"
              options={STATUS_FILTER_OPTIONS}
              value={draftFilters.status}
              onChange={(v) => handleDraftChange({ status: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Source"
              options={SOURCE_OPTIONS}
              value={draftFilters.source}
              onChange={(v) => handleDraftChange({ source: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Conflict Severity"
              options={CONFLICT_FILTER_OPTIONS}
              value={draftFilters.conflictSeverity}
              onChange={(v) => handleDraftChange({ conflictSeverity: v as string })}
              formControlProps={{ fullWidth: true }}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button variant="outlined" color="inherit" onClick={popover.onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </Stack>
      </CustomPopover>
    </>
  );
};

interface RoomAvailabilityActiveFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export const RoomAvailabilityActiveFilters = ({
  filters,
  onChange,
  onReset,
}: RoomAvailabilityActiveFiltersProps) => {
  const activeFilters = getActiveFilters(filters);

  const handleRemoveFilter = useCallback(
    (key: keyof Filters) => {
      onChange({ [key]: DEFAULT_ROOM_AVAILABILITY_FILTERS[key] });
    },
    [onChange]
  );

  if (activeFilters.length === 0) return null;

  return (
    <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
      {activeFilters.map((af) => (
        <Chip
          key={af.key}
          label={af.label}
          size="small"
          onDelete={() => handleRemoveFilter(af.key)}
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            color: 'primary.dark',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            borderStyle: 'solid',
            borderWidth: 1,
            fontSize: 12,
            fontWeight: 'fontWeightMedium',
            '& .MuiChip-deleteIcon': {
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark',
              },
            },
          }}
        />
      ))}
      <Button
        size="small"
        color="error"
        onClick={onReset}
        sx={{ typography: 'caption', height: 24, ml: 'auto' }}
      >
        Clear All
      </Button>
    </Stack>
  );
};
