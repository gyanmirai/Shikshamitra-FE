'use client';

import type { Dayjs } from 'dayjs';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';

export type ReviewDateFilterMode = 'all' | 'day' | 'range';

export type FilterToolbarProps = {
  selectedClass: string;
  onClassChange: (val: string) => void;
  classOptions: { label: string; value: string }[];
  selectedSubject: string;
  onSubjectChange: (val: string) => void;
  subjectOptions: { label: string; value: string }[];
  selectedReviewer: string;
  onReviewerChange: (val: string) => void;
  reviewerOptions: { label: string; value: string }[];
  dateFilterMode: ReviewDateFilterMode;
  onDateFilterModeChange: (mode: ReviewDateFilterMode) => void;
  filterDate: Dayjs | null;
  onFilterDateChange: (val: Dayjs | null) => void;
  rangeStart: Dayjs | null;
  onRangeStartChange: (val: Dayjs | null) => void;
  rangeEnd: Dayjs | null;
  onRangeEndChange: (val: Dayjs | null) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export const FilterToolbar = ({
  selectedClass,
  onClassChange,
  classOptions,
  selectedSubject,
  onSubjectChange,
  subjectOptions,
  selectedReviewer,
  onReviewerChange,
  reviewerOptions,
  dateFilterMode,
  onDateFilterModeChange,
  filterDate,
  onFilterDateChange,
  rangeStart,
  onRangeStartChange,
  rangeEnd,
  onRangeEndChange,
  onResetFilters,
  isFiltered,
  onRefresh,
  isRefreshing = false,
}: FilterToolbarProps) => (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={1}
      alignItems={{ xs: 'stretch', lg: 'center' }}
      justifyContent="space-between"
      sx={{ p: 1, flexWrap: 'wrap', gap: 1 }}
    >
      {/* Left Filters Group */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        flexWrap="wrap"
        useFlexGap
        sx={{ flexGrow: 1 }}
      >
        {/* Class Filter */}
        {classOptions.length > 0 && (
          <Box sx={{ minWidth: { xs: 1, sm: 130 } }}>
            <CustomSelect
              label="Class"
              options={[{ label: 'All Classes', value: 'all' }, ...classOptions]}
              labelKey="label"
              valueKey="value"
              value={selectedClass || 'all'}
              onChange={(val) => onClassChange(val === 'all' ? '' : String(val))}
              formControlProps={{ fullWidth: true, size: 'small', sx: { maxWidth: 'unset' } }}
            />
          </Box>
        )}

        {/* Subject Filter */}
        {subjectOptions.length > 0 && (
          <Box sx={{ minWidth: { xs: 1, sm: 130 } }}>
            <CustomSelect
              label="Subject"
              options={[{ label: 'All Subjects', value: 'all' }, ...subjectOptions]}
              labelKey="label"
              valueKey="value"
              value={selectedSubject || 'all'}
              onChange={(val) => onSubjectChange(val === 'all' ? '' : String(val))}
              formControlProps={{ fullWidth: true, size: 'small', sx: { maxWidth: 'unset' } }}
            />
          </Box>
        )}

        {/* Reviewer Filter */}
        {reviewerOptions.length > 0 && (
          <Box sx={{ minWidth: { xs: 1, sm: 140 } }}>
            <CustomSelect
              label="Reviewer"
              options={[{ label: 'All Reviewers', value: 'all' }, ...reviewerOptions]}
              labelKey="label"
              valueKey="value"
              value={selectedReviewer || 'all'}
              onChange={(val) => onReviewerChange(val === 'all' ? '' : String(val))}
              formControlProps={{ fullWidth: true, size: 'small', sx: { maxWidth: 'unset' } }}
            />
          </Box>
        )}

        {/* Dynamic Date Pickers (Inline after Reviewer) */}
        {dateFilterMode === 'day' && (
          <DatePicker
            label="Review date"
            value={filterDate}
            onChange={onFilterDateChange}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: 'small', sx: { width: 135 } } }}
          />
        )}

        {dateFilterMode === 'range' && (
          <Box sx={{ width: 220, minWidth: 200 }}>
            <CustomDateRangePicker
              label="Start Date - End Date"
              value={[rangeStart, rangeEnd]}
              dateFormat="DD/MM/YYYY"
              onChange={(value) => {
                onRangeStartChange(value[0]);
                onRangeEndChange(value[1] ? value[1].endOf('day') : null);
              }}
            />
          </Box>
        )}
      </Stack>

      {/* Right Side Group: Mode Toggle Buttons + Reset Icon */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexShrink: 0, ml: { lg: 'auto' } }}
      >
        {onRefresh && (
          <CustomTooltip title="Refresh review queue" arrow>
            <span>
              <IconButton
                size="small"
                color="primary"
                aria-label="Refresh review queue"
                onClick={onRefresh}
                disabled={isRefreshing}
                sx={{ flexShrink: 0 }}
              >
                <Iconify icon="solar:refresh-bold" width={20} />
              </IconButton>
            </span>
          </CustomTooltip>
        )}

        {/* Date Filter Mode Toggle */}
        <ToggleButtonGroup
          value={dateFilterMode}
          exclusive
          onChange={(_, val) => val && onDateFilterModeChange(val)}
          size="small"
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="range">Range</ToggleButton>
        </ToggleButtonGroup>

        {/* Reset Action (Icon Only with CustomTooltip) */}
        <CustomTooltip title="Reset Filters" arrow>
          <span>
            <IconButton
              size="small"
              color="error"
              onClick={onResetFilters}
              disabled={!isFiltered}
              sx={{ flexShrink: 0 }}
            >
              <Iconify icon="solar:restart-bold" width={20} />
            </IconButton>
          </span>
        </CustomTooltip>
      </Stack>
    </Stack>
  );

export default FilterToolbar;
