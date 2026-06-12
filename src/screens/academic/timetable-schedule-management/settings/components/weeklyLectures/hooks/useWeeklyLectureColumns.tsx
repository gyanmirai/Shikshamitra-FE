'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

import type { ISubjectFormValues } from '../type';

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
      { id: 'standardName', label: 'Class', filterType: 'number', align: 'left' },
      {
        id: 'totalLectures',
        label: 'Total Lectures',
        minWidth: 150,
        filterType: 'number',
        align: 'left',
      },
      {
        id: 'newSubject',
        label: 'Subjects',
        isSort: false,
        align: 'left',
        isFilter: false,
        render: (_value, row) => {
          const subjects = (row as ISubjectFormValues).subjects ?? [];
          return (
            <Box display="flex" flexWrap="wrap" gap={0.75} alignItems="center">
              {subjects.map((subject, idx) => (
                <Chip
                  key={subject.id ?? idx}
                  label={`${subject.electiveGroupName || subject.subjectName} (${subject.weeklyLectures})`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              ))}
            </Box>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 40,
        sticky: true,
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
