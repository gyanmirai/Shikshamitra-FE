'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Box, Chip, Stack, Button, Divider, Typography } from '@mui/material';

import {
  todayIso,
  roomOptions,
  classOptions,
  statusOptions,
  sourceOptions,
  reasonOptions,
  teacherOptions,
  subjectOptions,
  priorityOptions,
  conflictOptions,
  divisionOptions,
  departmentOptions,
  lectureSlotOptions,
  acknowledgementOptions,
} from '../substitutionData';

export type SubstitutionFiltersState = {
  filterDate: Dayjs | null;
  teacherFilter: string;
  classFilter: string;
  divisionFilter: string;
  subjectFilter: string;
  statusFilter: string;
  reasonFilter: string;
  periodFilter: string;
  priorityFilter: string;
  ackFilter: string;
  sourceFilter: string;
  conflictFilter: string;
  departmentFilter: string;
  roomFilter: string;
};

export const DEFAULT_SUBSTITUTION_FILTERS: SubstitutionFiltersState = {
  filterDate: dayjs(todayIso),
  teacherFilter: 'all',
  classFilter: 'all',
  divisionFilter: 'all',
  subjectFilter: 'all',
  statusFilter: 'all',
  reasonFilter: 'all',
  periodFilter: 'all',
  priorityFilter: 'all',
  ackFilter: 'all',
  sourceFilter: 'all',
  conflictFilter: 'all',
  departmentFilter: 'all',
  roomFilter: 'all',
};

// Helper function to determine active filters
export const getActiveFilters = (currentFilters: SubstitutionFiltersState) => {
  const active: { key: keyof SubstitutionFiltersState; label: string; value: any }[] = [];

  // Date
  if (!currentFilters.filterDate) {
    active.push({
      key: 'filterDate',
      label: 'Date: None',
      value: null,
    });
  } else if (!dayjs(currentFilters.filterDate).isSame(dayjs(todayIso), 'day')) {
    active.push({
      key: 'filterDate',
      label: `Date: ${dayjs(currentFilters.filterDate).format('DD/MM/YYYY')}`,
      value: currentFilters.filterDate,
    });
  }

  // Teacher
  if (currentFilters.teacherFilter !== 'all') {
    const opt = teacherOptions.find((o) => o.value === currentFilters.teacherFilter);
    active.push({
      key: 'teacherFilter',
      label: `Teacher: ${opt ? opt.label : currentFilters.teacherFilter}`,
      value: currentFilters.teacherFilter,
    });
  }

  // Class
  if (currentFilters.classFilter !== 'all') {
    const opt = classOptions.find((o) => o.value === currentFilters.classFilter);
    active.push({
      key: 'classFilter',
      label: `Class: ${opt ? opt.label : currentFilters.classFilter}`,
      value: currentFilters.classFilter,
    });
  }

  // Division
  if (currentFilters.divisionFilter !== 'all') {
    const opt = divisionOptions.find((o) => o.value === currentFilters.divisionFilter);
    active.push({
      key: 'divisionFilter',
      label: `Div: ${opt ? opt.label : currentFilters.divisionFilter}`,
      value: currentFilters.divisionFilter,
    });
  }

  // Period
  if (currentFilters.periodFilter !== 'all') {
    const opt = lectureSlotOptions.find((o) => o.value === currentFilters.periodFilter);
    active.push({
      key: 'periodFilter',
      label: `Period: ${opt ? opt.label.split(' - ')[0] : currentFilters.periodFilter}`,
      value: currentFilters.periodFilter,
    });
  }

  // Subject
  if (currentFilters.subjectFilter !== 'all') {
    const opt = subjectOptions.find((o) => o.value === currentFilters.subjectFilter);
    active.push({
      key: 'subjectFilter',
      label: `Subject: ${opt ? opt.label : currentFilters.subjectFilter}`,
      value: currentFilters.subjectFilter,
    });
  }

  // Status
  if (currentFilters.statusFilter !== 'all') {
    const opt = statusOptions.find((o) => o.value === currentFilters.statusFilter);
    active.push({
      key: 'statusFilter',
      label: `Status: ${opt ? opt.label : currentFilters.statusFilter}`,
      value: currentFilters.statusFilter,
    });
  }

  // Priority
  if (currentFilters.priorityFilter !== 'all') {
    const opt = priorityOptions.find((o) => o.value === currentFilters.priorityFilter);
    active.push({
      key: 'priorityFilter',
      label: `Priority: ${opt ? opt.label : currentFilters.priorityFilter}`,
      value: currentFilters.priorityFilter,
    });
  }

  // Acknowledgement
  if (currentFilters.ackFilter !== 'all') {
    const opt = acknowledgementOptions.find((o) => o.value === currentFilters.ackFilter);
    active.push({
      key: 'ackFilter',
      label: `Ack: ${opt ? opt.label : currentFilters.ackFilter}`,
      value: currentFilters.ackFilter,
    });
  }

  // Source
  if (currentFilters.sourceFilter !== 'all') {
    const opt = sourceOptions.find((o) => o.value === currentFilters.sourceFilter);
    active.push({
      key: 'sourceFilter',
      label: `Source: ${opt ? opt.label : currentFilters.sourceFilter}`,
      value: currentFilters.sourceFilter,
    });
  }

  // Conflict
  if (currentFilters.conflictFilter !== 'all') {
    const opt = conflictOptions.find((o) => o.value === currentFilters.conflictFilter);
    active.push({
      key: 'conflictFilter',
      label: `Conflict: ${opt ? opt.label : currentFilters.conflictFilter}`,
      value: currentFilters.conflictFilter,
    });
  }

  // Department
  if (currentFilters.departmentFilter !== 'all') {
    const opt = departmentOptions.find((o) => o.value === currentFilters.departmentFilter);
    active.push({
      key: 'departmentFilter',
      label: `Dept: ${opt ? opt.label : currentFilters.departmentFilter}`,
      value: currentFilters.departmentFilter,
    });
  }

  // Room
  if (currentFilters.roomFilter !== 'all') {
    const opt = roomOptions.find((o) => o.value === currentFilters.roomFilter);
    active.push({
      key: 'roomFilter',
      label: `Room: ${opt ? opt.label : currentFilters.roomFilter}`,
      value: currentFilters.roomFilter,
    });
  }

  // Reason
  if (currentFilters.reasonFilter !== 'all') {
    const opt = reasonOptions.find((o) => o.value === currentFilters.reasonFilter);
    active.push({
      key: 'reasonFilter',
      label: `Reason: ${opt ? opt.label : currentFilters.reasonFilter}`,
      value: currentFilters.reasonFilter,
    });
  }

  return active;
};

interface SubstitutionFiltersProps {
  filters: SubstitutionFiltersState;
  onChange: (patch: Partial<SubstitutionFiltersState>) => void;
  onReset: () => void;
}

export const SubstitutionFilters = ({ filters, onChange, onReset }: SubstitutionFiltersProps) => {
  const popover = usePopover();
  const [draftFilters, setDraftFilters] = useState<SubstitutionFiltersState>(filters);

  // Sync draft filters when the popover opens
  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setDraftFilters(filters);
      popover.onOpen(event);
    },
    [filters, popover]
  );

  const handleDraftChange = useCallback((patch: Partial<SubstitutionFiltersState>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onChange(draftFilters);
    popover.onClose();
  }, [draftFilters, onChange, popover]);

  const handleResetDraftFilters = useCallback(() => {
    setDraftFilters(DEFAULT_SUBSTITUTION_FILTERS);
  }, []);

  const handleSaveView = useCallback(() => {
    shikshaMitraToast.success({ message: 'Current substitution view saved.' });
    popover.onClose();
  }, [popover]);

  const activeFiltersCount = getActiveFilters(filters).length;

  const teacherFilterOptions = [{ value: 'all', label: 'All Teachers' }, ...teacherOptions];
  const classFilterOptions = [{ value: 'all', label: 'All Classes' }, ...classOptions];
  const divisionFilterOptions = [{ value: 'all', label: 'All Divisions' }, ...divisionOptions];
  const subjectFilterOptions = [{ value: 'all', label: 'All Subjects' }, ...subjectOptions];
  const reasonFilterOptions = [{ value: 'all', label: 'All Reasons' }, ...reasonOptions];
  const periodFilterOptions = [{ value: 'all', label: 'All Periods' }, ...lectureSlotOptions];
  const priorityFilterOptions = [{ value: 'all', label: 'All Priorities' }, ...priorityOptions];
  const roomFilterOptions = [{ value: 'all', label: 'All Rooms' }, ...roomOptions];

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
              width: 580,
              maxWidth: '95vw',
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'fontWeightSemiBold' }}>
            Filter Substitutions
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={handleSaveView}
              startIcon={<Iconify icon="mdi:bookmark-outline" width={14} />}
              sx={{ color: 'text.secondary', typography: 'caption' }}
            >
              Save View
            </Button>
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
        </Stack>

        <Stack spacing={1} sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5, mb: 3 }}>
          {/* Section 1: General Info */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            General & Staff
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            <DatePicker
              label="Date"
              value={draftFilters.filterDate}
              format="DD/MM/YYYY"
              onChange={(value) => handleDraftChange({ filterDate: value })}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <CustomSelect
              label="Teacher"
              options={teacherFilterOptions}
              value={draftFilters.teacherFilter}
              onChange={(v) => handleDraftChange({ teacherFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Department"
              options={departmentOptions}
              value={draftFilters.departmentFilter}
              onChange={(v) => handleDraftChange({ departmentFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Reason"
              options={reasonFilterOptions}
              value={draftFilters.reasonFilter}
              onChange={(v) => handleDraftChange({ reasonFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
          </Box>

          <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

          {/* Section 2: Lecture & Classes */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Academic & Rooms
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            <CustomSelect
              label="Class"
              options={classFilterOptions}
              value={draftFilters.classFilter}
              onChange={(v) => handleDraftChange({ classFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Division"
              options={divisionFilterOptions}
              value={draftFilters.divisionFilter}
              onChange={(v) => handleDraftChange({ divisionFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Period"
              options={periodFilterOptions}
              value={draftFilters.periodFilter}
              onChange={(v) => handleDraftChange({ periodFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Subject"
              options={subjectFilterOptions}
              value={draftFilters.subjectFilter}
              onChange={(v) => handleDraftChange({ subjectFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Room"
              options={roomFilterOptions}
              value={draftFilters.roomFilter}
              onChange={(v) => handleDraftChange({ roomFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
          </Box>

          <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

          {/* Section 3: Status & Priority */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Status & Workflow
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            <CustomSelect
              label="Status"
              options={statusOptions}
              value={draftFilters.statusFilter}
              onChange={(v) => handleDraftChange({ statusFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Priority"
              options={priorityFilterOptions}
              value={draftFilters.priorityFilter}
              onChange={(v) => handleDraftChange({ priorityFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Acknowledgement"
              options={acknowledgementOptions}
              value={draftFilters.ackFilter}
              onChange={(v) => handleDraftChange({ ackFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Source"
              options={sourceOptions}
              value={draftFilters.sourceFilter}
              onChange={(v) => handleDraftChange({ sourceFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Conflict"
              options={conflictOptions}
              value={draftFilters.conflictFilter}
              onChange={(v) => handleDraftChange({ conflictFilter: v as string })}
              formControlProps={{ fullWidth: true }}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
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
  filters: SubstitutionFiltersState;
  onChange: (patch: Partial<SubstitutionFiltersState>) => void;
  onReset: () => void;
}

export const SubstitutionActiveFilters = ({
  filters,
  onChange,
  onReset,
}: RoomAvailabilityActiveFiltersProps) => {
  const activeFilters = getActiveFilters(filters);

  const handleRemoveFilter = useCallback(
    (key: keyof SubstitutionFiltersState) => {
      onChange({ [key]: DEFAULT_SUBSTITUTION_FILTERS[key] });
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
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.12),
            color: 'info.main',
            borderColor: (theme) => alpha(theme.palette.info.main, 0.28),
            borderStyle: 'solid',
            borderWidth: 1,
            fontSize: 12,
            fontWeight: 'fontWeightMedium',
            maxWidth: 260,
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            '& .MuiChip-deleteIcon': {
              color: 'info.main',
              '&:hover': {
                color: 'info.dark',
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
