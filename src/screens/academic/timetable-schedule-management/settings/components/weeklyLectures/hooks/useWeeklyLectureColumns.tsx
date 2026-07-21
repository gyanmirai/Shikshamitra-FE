'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { TIMETABLE_STATUS_LABEL } from 'src/utils/timetable-capacity';
import { TimetableStatusChip } from 'src/components/timetable-status-chip/TimetableStatusChip';

import type { ISubjectFormValues } from '../type';

const MAX_VISIBLE_SUBJECT_CHIPS = 2;

const TIMETABLE_SETTING_STATUS_FILTER_OPTIONS = Object.values(TIMETABLE_STATUS_LABEL).map(
  (label) => ({ value: label, label })
);

interface UseWeeklyLectureColumnsArgs {
  onView: (row: ISubjectFormValues) => void;
  onEdit: (row: ISubjectFormValues) => void;
  canAdd?: boolean;
}

/**
 * Memoized column definition for the weekly-lectures list table.
 *
 * `useMemo` is justified here:
 * - the columns array is consumed by a heavy memoized table component
 * - re-creating the array on every parent render would invalidate row memo
 *   and trigger a full table re-render.
 */
export function useWeeklyLectureColumns({
  onView,
  onEdit,
  canAdd = true,
}: UseWeeklyLectureColumnsArgs): IColumn[] {
  return useMemo<IColumn[]>(
    () => [
      {
        id: 'standardName',
        label: 'Class',
        filterType: 'string',
        align: 'left',
        sticky: true,
        stickyPosition: 'left',
        minWidth: 120,
      },
      {
        id: 'totalLectures',
        label: 'Required Weekly Lectures',
        minWidth: 150,
        filterType: 'number',
        align: 'left',
      },
      {
        id: 'availableTeachingCapacity',
        label: 'Available Teaching Capacity',
        minWidth: 150,
        filterType: 'number',
        align: 'left',
        render: (value) => (value == null ? '—' : `${value}/week`),
      },
      {
        id: 'difference',
        label: 'Difference',
        minWidth: 110,
        filterType: 'number',
        align: 'left',
        render: (value) => {
          if (value == null) return '—';
          const diff = Number(value);
          if (diff === 0) return '0';
          return diff > 0 ? `+${diff} free` : `${diff} over`;
        },
      },
      {
        id: 'newSubject',
        label: 'Subjects',
        isSort: false,
        align: 'left',
        filterType: 'string',
        minWidth: 220,
        render: (_value, row) => {
          const subjects = (row as ISubjectFormValues).subjects ?? [];
          const visible = subjects.slice(0, MAX_VISIBLE_SUBJECT_CHIPS);
          const overflow = subjects.slice(MAX_VISIBLE_SUBJECT_CHIPS);
          return (
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1}
              alignItems="center"
              sx={{ maxHeight: 56, overflow: 'hidden' }}
            >
              {visible.map((subject, idx) => (
                <Chip
                  key={subject.id ?? idx}
                  label={`${subject.electiveGroupName || subject.subjectName} · ${subject.weeklyLectures}/wk`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              ))}
              {overflow.length > 0 && (
                <CustomTooltip
                  title={
                    <Box display="flex" flexDirection="column" gap={1} p={0.5}>
                      {overflow.map((subject, idx) => (
                        <span key={subject.id ?? idx}>
                          {subject.electiveGroupName || subject.subjectName} ·{' '}
                          {subject.weeklyLectures}/wk
                        </span>
                      ))}
                    </Box>
                  }
                >
                  <Chip
                    label={`+${overflow.length} more`}
                    size="small"
                    variant="soft"
                    color="primary"
                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                  />
                </CustomTooltip>
              )}
            </Box>
          );
        },
      },
      {
        id: 'statusLabel',
        label: 'Status',
        minWidth: 170,
        isSort: false,
        filterType: 'enum',
        enumOptions: TIMETABLE_SETTING_STATUS_FILTER_OPTIONS,
        align: 'left',
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row) => {
          const status = (row as ISubjectFormValues).status;
          return status != null ? <TimetableStatusChip status={status} /> : '—';
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 40,
        sticky: true,
        stickyPosition: 'right',
        align: 'left',
        isSort: false,
        isFilter: false,
        render: (_value, row) => (
          <ThreeDotsActions
            // showViewIcon
            // handleViewClick={() => onView(row as ISubjectFormValues)}
            showEditIcon={canAdd}
            showThreeDots={false}
            handleEditClick={() => onEdit(row as ISubjectFormValues)}
            placement="right-top"
          />
        ),
      },
    ],
    [onEdit, canAdd]
  );
}
