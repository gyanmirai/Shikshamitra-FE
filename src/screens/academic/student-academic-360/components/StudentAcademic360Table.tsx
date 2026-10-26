'use client';

import type { IData } from 'src/components/customizabaleTable/types';

import { Iconify } from 'src/components/iconify';
import { Box, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { normalizeAcademicStudent } from '../listUtils';
import { Academic360EmptyState } from './Academic360EmptyState';
import { studentAcademic360Columns } from './studentAcademic360Columns';

import type { Academic360StudentRow } from '../types';
import type { StudentAcademicListItem } from '../listUtils';

type StudentAcademic360TableProps = {
  students: Academic360StudentRow[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
  activeFilterLabel?: string;
  onOpenStudent: (student: Academic360StudentRow) => void;
  onRetry: () => void;
  onPagination: (page: number, rowsPerPage: number) => void;
  onSearch: (searchTerm: string) => void;
  onSort: (column: string, sorts: Array<{ column: string; direction: 'asc' | 'desc' }>) => void;
};

export function StudentAcademic360Table({
  students,
  totalCount,
  page,
  rowsPerPage,
  searchTerm,
  isLoading,
  isError,
  isReady,
  activeFilterLabel,
  onOpenStudent,
  onRetry,
  onPagination,
  onSearch,
  onSort,
}: StudentAcademic360TableProps) {
  const items = students.map(normalizeAcademicStudent);

  const openStudentRow = (row: IData) => {
    const item = row as StudentAcademicListItem;
    if (item.studentId) onOpenStudent(item.student);
  };

  if (isError) {
    return (
      <Box
        sx={{ minHeight: 300, display: 'grid', placeItems: 'center', px: 2, textAlign: 'center' }}
      >
        <Box>
          <Iconify icon="mdi:cloud-alert-outline" width={42} sx={{ color: 'error.main', mb: 1 }} />
          <Typography variant="subtitle1">Student data could not be loaded.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Your selected filters have been preserved.
          </Typography>
          <Button size="small" variant="outlined" sx={{ mt: 1.5 }} onClick={onRetry}>
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (!isReady) {
    return (
      <Box
        sx={{ minHeight: 300, display: 'grid', placeItems: 'center', px: 2, textAlign: 'center' }}
      >
        <Academic360EmptyState
          title="Select academic year, board and medium"
          description="Students will appear after the academic context is selected."
        />
      </Box>
    );
  }

  return (
    <CustomizableTable
      tableTitle="Student Academic Profiles"
      tableId="student-academic-360-table"
      columns={studentAcademic360Columns}
      data={items}
      handleRowClick={openStudentRow}
      rowProps={(row) => ({
        tabIndex: row.studentId ? 0 : -1,
        'data-student-id': row.studentId,
        'aria-label': `Open Academic 360 for ${row.name}`,
        onKeyDown: (event) => {
          if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
          event.preventDefault();
          openStudentRow(row);
        },
        sx: {
          cursor: row.studentId ? 'pointer' : 'default',
          '&:focus-visible': {
            outline: (theme) => `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
          },
        },
      })}
      isLoading={isLoading}
      isShowedDense
      isFilter={false}
      serverSidePagination
      serverSideSearch
      serverSideSort
      serverSideSortMode="single"
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      searchTerm={searchTerm}
      rowsPerPageOptions={[10, 25, 100]}
      onServerPagination={onPagination}
      onServerSearch={onSearch}
      onServerSort={onSort}
      exportLabel="Export current page"
      noDataText={
        activeFilterLabel && activeFilterLabel !== 'all'
          ? `No students match the ${activeFilterLabel} filter.`
          : 'No students found in the selected scope.'
      }
    />
  );
}
