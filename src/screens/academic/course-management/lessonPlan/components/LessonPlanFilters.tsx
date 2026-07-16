'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useCallback } from 'react';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Box, Chip, Stack, Button, Divider, Typography } from '@mui/material';

import {
  classOptions,
  weekStartIso,
  teacherOptions,
  chapterOptions,
  subjectOptions,
  divisionOptions,
  planStatusOptions,
  diaryStatusOptions,
  approvalStatusOptions,
} from '../lessonPlanData';

export interface LessonPlanFiltersState {
  academicYear: string;
  teacher: string;
  class: string;
  division: string;
  subject: string;
  chapter: string;
  planStatus: string;
  diaryStatus: string;
  approvalStatus: string;
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
  quickFilter: string | null;
}

export const DEFAULT_LESSON_PLAN_FILTERS: LessonPlanFiltersState = {
  academicYear: '2026-27',
  teacher: 'all',
  class: 'all',
  division: 'all',
  subject: 'all',
  chapter: 'all',
  planStatus: 'all',
  diaryStatus: 'all',
  approvalStatus: 'all',
  fromDate: dayjs(weekStartIso),
  toDate: dayjs(weekStartIso).add(6, 'day'),
  quickFilter: null,
};

const QUICK_FILTER_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'pending_diary', label: 'Pending Diary' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'missed_lessons', label: 'Missed Lessons' },
  { value: 'delayed_progress', label: 'Delayed Progress' },
  { value: 'no_evidence', label: 'No Evidence' },
  { value: 'backdated', label: 'Backdated' },
  { value: 'my_lessons', label: 'My Lessons' },
  { value: 'my_reviews', label: 'My Reviews' },
];

const allClassOptions = [{ value: 'all', label: 'All Classes' }, ...classOptions];
const allDivisionOptions = [{ value: 'all', label: 'All Divisions' }, ...divisionOptions];
const allSubjectOptions = [{ value: 'all', label: 'All Subjects' }, ...subjectOptions];
const allChapterOptions = [{ value: 'all', label: 'All Chapters' }, ...chapterOptions];
const allTeacherOptions = [{ value: 'all', label: 'All Teachers' }, ...teacherOptions];

export const getActiveFilters = (currentFilters: LessonPlanFiltersState) => {
  const active: { key: keyof LessonPlanFiltersState; label: string; value: any }[] = [];

  // Date Range
  const defaultFrom = DEFAULT_LESSON_PLAN_FILTERS.fromDate?.format('YYYY-MM-DD');
  const currentFrom = currentFilters.fromDate?.format('YYYY-MM-DD');
  const defaultTo = DEFAULT_LESSON_PLAN_FILTERS.toDate?.format('YYYY-MM-DD');
  const currentTo = currentFilters.toDate?.format('YYYY-MM-DD');

  if (currentFrom !== defaultFrom || currentTo !== defaultTo) {
    const fromStr = currentFilters.fromDate ? currentFilters.fromDate.format('DD/MM/YY') : '';
    const toStr = currentFilters.toDate ? currentFilters.toDate.format('DD/MM/YY') : '';
    active.push({
      key: 'fromDate',
      label: `Date: ${fromStr} – ${toStr}`,
      value: { from: currentFilters.fromDate, to: currentFilters.toDate },
    });
  }

  // Academic Year
  if (currentFilters.academicYear !== DEFAULT_LESSON_PLAN_FILTERS.academicYear) {
    active.push({
      key: 'academicYear',
      label: `Year: ${currentFilters.academicYear}`,
      value: currentFilters.academicYear,
    });
  }

  // Quick Filter
  if (currentFilters.quickFilter) {
    const opt = QUICK_FILTER_OPTIONS.find((o) => o.value === currentFilters.quickFilter);
    active.push({
      key: 'quickFilter',
      label: `Quick: ${opt ? opt.label : currentFilters.quickFilter}`,
      value: currentFilters.quickFilter,
    });
  }

  // Teacher
  if (currentFilters.teacher !== 'all') {
    active.push({
      key: 'teacher',
      label: `Teacher: ${currentFilters.teacher}`,
      value: currentFilters.teacher,
    });
  }

  // Class
  if (currentFilters.class !== 'all') {
    active.push({
      key: 'class',
      label: `Class: ${currentFilters.class}`,
      value: currentFilters.class,
    });
  }

  // Division
  if (currentFilters.division !== 'all') {
    active.push({
      key: 'division',
      label: `Div: ${currentFilters.division}`,
      value: currentFilters.division,
    });
  }

  // Subject
  if (currentFilters.subject !== 'all') {
    active.push({
      key: 'subject',
      label: `Subject: ${currentFilters.subject}`,
      value: currentFilters.subject,
    });
  }

  // Chapter
  if (currentFilters.chapter !== 'all') {
    active.push({
      key: 'chapter',
      label: `Chapter: ${currentFilters.chapter}`,
      value: currentFilters.chapter,
    });
  }

  // Plan Status
  if (currentFilters.planStatus !== 'all') {
    const opt = planStatusOptions.find((o) => o.value === currentFilters.planStatus);
    active.push({
      key: 'planStatus',
      label: `Plan: ${opt ? opt.label : currentFilters.planStatus}`,
      value: currentFilters.planStatus,
    });
  }

  // Diary Status
  if (currentFilters.diaryStatus !== 'all') {
    const opt = diaryStatusOptions.find((o) => o.value === currentFilters.diaryStatus);
    active.push({
      key: 'diaryStatus',
      label: `Diary: ${opt ? opt.label : currentFilters.diaryStatus}`,
      value: currentFilters.diaryStatus,
    });
  }

  // Approval Status
  if (currentFilters.approvalStatus !== 'all') {
    const opt = approvalStatusOptions.find((o) => o.value === currentFilters.approvalStatus);
    active.push({
      key: 'approvalStatus',
      label: `Approval: ${opt ? opt.label : currentFilters.approvalStatus}`,
      value: currentFilters.approvalStatus,
    });
  }

  return active;
};

interface LessonPlanFiltersProps {
  filters: LessonPlanFiltersState;
  onChange: (patch: Partial<LessonPlanFiltersState>) => void;
  onReset: () => void;
}

export const LessonPlanFilters = ({ filters, onChange, onReset }: LessonPlanFiltersProps) => {
  const popover = usePopover();
  const [draftFilters, setDraftFilters] = useState<LessonPlanFiltersState>(filters);

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setDraftFilters(filters);
      popover.onOpen(event);
    },
    [filters, popover]
  );

  const handleDraftChange = useCallback((patch: Partial<LessonPlanFiltersState>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onChange(draftFilters);
    popover.onClose();
  }, [draftFilters, onChange, popover]);

  const handleResetDraftFilters = useCallback(() => {
    setDraftFilters(DEFAULT_LESSON_PLAN_FILTERS);
  }, []);

  const activeFiltersCount = useMemo(() => getActiveFilters(filters).length, [filters]);

  const quickFilterDropdownOptions = useMemo(
    () => [{ value: '', label: 'No Quick Filter' }, ...QUICK_FILTER_OPTIONS],
    []
  );

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
            Filter Lesson Plans
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

        <Stack spacing={1} sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5, mb: 3 }}>
          {/* Section 1: Period & Quick filter */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Time & Shortcuts
          </Typography>
          <CustomSelect
            label="Quick Filter"
            options={quickFilterDropdownOptions}
            value={draftFilters.quickFilter || ''}
            onChange={(v) => handleDraftChange({ quickFilter: (v as string) || null })}
            formControlProps={{ fullWidth: true }}
          />

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            <DatePicker
              label="From Date"
              value={draftFilters.fromDate}
              onChange={(val) => handleDraftChange({ fromDate: val })}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="To Date"
              value={draftFilters.toDate}
              onChange={(val) => handleDraftChange({ toDate: val })}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>

          <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

          {/* Section 2: Academic Specs */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Academic Info
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            <CustomSelect
              label="Teacher"
              options={allTeacherOptions}
              value={draftFilters.teacher}
              onChange={(v) => handleDraftChange({ teacher: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Class"
              options={allClassOptions}
              value={draftFilters.class}
              onChange={(v) => handleDraftChange({ class: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Division"
              options={allDivisionOptions}
              value={draftFilters.division}
              onChange={(v) => handleDraftChange({ division: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Subject"
              options={allSubjectOptions}
              value={draftFilters.subject}
              onChange={(v) => handleDraftChange({ subject: v as string })}
              formControlProps={{ fullWidth: true }}
            />
          </Box>
          <CustomSelect
            label="Chapter"
            options={allChapterOptions}
            value={draftFilters.chapter}
            onChange={(v) => handleDraftChange({ chapter: v as string })}
            formControlProps={{ fullWidth: true }}
          />

          <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

          {/* Section 3: Status Details */}
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Status info
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={1}>
            <CustomSelect
              label="Plan Status"
              options={planStatusOptions}
              value={draftFilters.planStatus}
              onChange={(v) => handleDraftChange({ planStatus: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Diary Status"
              options={diaryStatusOptions}
              value={draftFilters.diaryStatus}
              onChange={(v) => handleDraftChange({ diaryStatus: v as string })}
              formControlProps={{ fullWidth: true }}
            />
            <CustomSelect
              label="Approval Status"
              options={approvalStatusOptions}
              value={draftFilters.approvalStatus}
              onChange={(v) => handleDraftChange({ approvalStatus: v as string })}
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

interface LessonPlanActiveFiltersProps {
  filters: LessonPlanFiltersState;
  onChange: (patch: Partial<LessonPlanFiltersState>) => void;
  onReset: () => void;
}

export const LessonPlanActiveFilters = ({
  filters,
  onChange,
  onReset,
}: LessonPlanActiveFiltersProps) => {
  const activeFilters = useMemo(() => getActiveFilters(filters), [filters]);

  const handleRemoveFilter = useCallback(
    (key: keyof LessonPlanFiltersState) => {
      onChange({ [key]: DEFAULT_LESSON_PLAN_FILTERS[key] });
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
