'use client';

import type { IParams } from 'src/components/customizabaleTable/types';

import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { normalizeAcademicStudent } from '../listUtils';
import { NotifyParentDialog } from './NotifyParentDialog';
import { createStudentAcademic360Columns } from './studentAcademic360Columns';

import type { Academic360StudentRow } from '../types';

type StudentAcademic360TableProps = {
  students: Academic360StudentRow[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  sorts: IParams['sorts'];
  isLoading: boolean;
  isError: boolean;
  activeFilterLabel?: string;
  onOpenStudent: (student: Academic360StudentRow) => void;
  onRetry: () => void;
  onPagination: (page: number, rowsPerPage: number) => void;
  onSearch: (searchTerm: string) => void;
  onSort: (column: string, sorts: IParams['sorts']) => void;
};

export function StudentAcademic360Table({
  students,
  totalCount,
  page,
  rowsPerPage,
  searchTerm,
  sorts,
  isLoading,
  isError,
  activeFilterLabel,
  onOpenStudent,
  onRetry,
  onPagination,
  onSearch,
  onSort,
}: StudentAcademic360TableProps) {
  const [notifyStudent, setNotifyStudent] = useState<Academic360StudentRow | null>(null);
  /**
   * Memoization Justification:
   * - Column definitions drive sticky-column measurement and table configuration effects.
   * - Keeping them stable prevents that work from restarting during loading and pagination renders.
   */
  const columns = useMemo(
    () => createStudentAcademic360Columns(setNotifyStudent, onOpenStudent),
    [onOpenStudent]
  );
  const items = students.map(normalizeAcademicStudent);

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

  const emptyMessage =
    activeFilterLabel && activeFilterLabel !== 'all'
      ? `No students match the ${activeFilterLabel} filter.`
      : 'Students will appear here after they are enrolled and assigned to this class.';

  return (
    <>
      <CustomizableTable
        tableId="student-academic-360-table"
        tableTitle="Student Academic 360"
        columns={columns}
        data={items}
        isLoading={isLoading}
        serverSide
        serverSidePagination
        serverSideSearch
        serverSideSort
        serverSideSortMode="single"
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        sorts={sorts}
        onServerPagination={onPagination}
        onServerSearch={onSearch}
        onServerSort={onSort}
        isShowedDense
        noDataText={emptyMessage}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
      />
      <NotifyParentDialog
        open={!!notifyStudent}
        student={notifyStudent}
        onClose={() => setNotifyStudent(null)}
      />
    </>
  );
}
