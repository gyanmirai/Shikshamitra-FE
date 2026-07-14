'use client';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Table,
  Button,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  TableSortLabel,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import {
  sortAcademicStudents,
  normalizeAcademicStudent,
} from '../listUtils';
import { StudentAcademic360TableRow } from './StudentAcademic360TableRow';

import type { AcademicSortKey } from '../listUtils';
import type { Academic360StudentRow } from '../types';

type StudentAcademic360TableProps = {
  students: Academic360StudentRow[];
  isLoading: boolean;
  isError: boolean;
  hasDivision: boolean;
  searchTerm: string;
  activeFilterLabel: string;
  page: number;
  rowsPerPage: number;
  sortKey: AcademicSortKey;
  sortDirection: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSortChange: (sortKey: AcademicSortKey) => void;
  onOpenStudent: (student: Academic360StudentRow) => void;
  onClearSearch: () => void;
  onRetry: () => void;
};

const SortCell = ({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: AcademicSortKey;
  activeKey: AcademicSortKey;
  direction: 'asc' | 'desc';
  onSort: (sortKey: AcademicSortKey) => void;
}) => (
  <TableCell sortDirection={activeKey === sortKey ? direction : false}>
    <TableSortLabel
      active={activeKey === sortKey}
      direction={activeKey === sortKey ? direction : 'asc'}
      onClick={() => onSort(sortKey)}
    >
      {label}
    </TableSortLabel>
  </TableCell>
);

export function StudentAcademic360Table({
  students,
  isLoading,
  isError,
  hasDivision,
  searchTerm,
  activeFilterLabel,
  page,
  rowsPerPage,
  sortKey,
  sortDirection,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  onOpenStudent,
  onClearSearch,
  onRetry,
}: StudentAcademic360TableProps) {
  const items = sortAcademicStudents(students.map(normalizeAcademicStudent), sortKey, sortDirection);
  const visibleItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ minHeight: 300, display: 'grid', placeItems: 'center', px: 2, textAlign: 'center' }}>
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

  if (!hasDivision || students.length === 0) {
    const hasSearch = Boolean(searchTerm.trim());

    return (
      <Box sx={{ minHeight: 300, display: 'grid', placeItems: 'center', px: 2, textAlign: 'center' }}>
        <Box>
          <Iconify icon="mdi:account-search-outline" width={42} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="subtitle1">
            {!hasDivision ? 'Select class and division' : hasSearch ? `No students match "${searchTerm}"` : 'No students found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {!hasDivision
              ? 'Students will appear here after both filters are selected.'
              : hasSearch
                ? 'Try another name, GR number or roll number.'
                : 'Students will appear here after they are enrolled and assigned to this class.'}
          </Typography>
          {hasSearch && (
            <Button size="small" sx={{ mt: 1.5 }} onClick={onClearSearch}>
              Clear Search
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 430px)', minHeight: 320 }}>
        <Table stickyHeader size="small" aria-label={`Student Academic 360 table filtered by ${activeFilterLabel}`}>
          <TableHead>
            <TableRow>
              <SortCell label="Student" sortKey="studentName" activeKey={sortKey} direction={sortDirection} onSort={onSortChange} />
              <SortCell label="Attendance" sortKey="attendance" activeKey={sortKey} direction={sortDirection} onSort={onSortChange} />
              <SortCell label="Homework" sortKey="homework" activeKey={sortKey} direction={sortDirection} onSort={onSortChange} />
              <SortCell label="Exam Average" sortKey="examAverage" activeKey={sortKey} direction={sortDirection} onSort={onSortChange} />
              <SortCell label="Trend" sortKey="priority" activeKey={sortKey} direction={sortDirection} onSort={onSortChange} />
              <SortCell label="Academic Health" sortKey="academicHealth" activeKey={sortKey} direction={sortDirection} onSort={onSortChange} />
              <SortCell label="Alerts" sortKey="alertCount" activeKey={sortKey} direction={sortDirection} onSort={onSortChange} />
              <SortCell label="Last Updated" sortKey="lastUpdated" activeKey={sortKey} direction={sortDirection} onSort={onSortChange} />
              <TableCell align="right" sx={{ width: 96 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleItems.map((item) => (
              <StudentAcademic360TableRow
                key={item.studentId || item.name}
                item={item}
                onOpenStudent={onOpenStudent}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={items.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </>
  );
}
