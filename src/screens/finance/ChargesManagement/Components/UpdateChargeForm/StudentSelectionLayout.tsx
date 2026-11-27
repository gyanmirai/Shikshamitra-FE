'use client';

import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  List,
  Stack,
  Paper,
  Checkbox,
  ListItem,
  Skeleton,
  TextField,
  Typography,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import { toggleFilteredStudents } from './studentFilters';

interface IStudentOption {
  id: string;
  label: string;
  rollNumber?: number;
  grNumber?: string;
  divisionName?: string;
}

interface StudentSelectionLayoutProps {
  students: IStudentOption[];
  selectedStudentIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  totalCount?: number;
  candidateCount?: number;
  matchingStudentIds?: string[];
  page?: number;
  onPageChange?: (page: number) => void;
  disabled?: boolean;
  emptyMessage?: string;
}

/**
 * Student Selection Layout Component
 * Displays list of students with checkboxes and search capability
 * Select All affects every filtered result and preserves other selections
 */
export const StudentSelectionLayout: React.FC<StudentSelectionLayoutProps> = ({
  students,
  selectedStudentIds,
  onSelectionChange,
  isLoading = false,
  searchQuery = '',
  onSearchChange,
  totalCount = students.length,
  candidateCount = totalCount,
  matchingStudentIds = students.map((student) => student.id),
  page = 0,
  onPageChange,
  disabled = false,
  emptyMessage,
}) => {
  const localSearchQuery = searchQuery;
  const handleSearchChange = (query: string) => onSearchChange?.(query);
  // Handle individual student selection
  const handleStudentToggle = useCallback(
    (studentId: string) => {
      const isSelected = selectedStudentIds.includes(studentId);
      const newSelection = isSelected
        ? selectedStudentIds.filter((id) => id !== studentId)
        : [...selectedStudentIds, studentId];

      onSelectionChange(newSelection);
    },
    [selectedStudentIds, onSelectionChange]
  );

  const filteredStudents = students;

  // Handle select all toggle
  const handleSelectAllToggle = useCallback(() => {
    onSelectionChange(toggleFilteredStudents(selectedStudentIds, matchingStudentIds));
  }, [matchingStudentIds, selectedStudentIds, onSelectionChange]);

  const selectAllChecked = useMemo(
    () =>
      matchingStudentIds.length > 0 &&
      matchingStudentIds.every((id) => selectedStudentIds.includes(id)),
    [matchingStudentIds, selectedStudentIds]
  );

  const selectAllIndeterminate =
    !selectAllChecked && matchingStudentIds.some((id) => selectedStudentIds.includes(id));

  const currentPage = Math.min(page, Math.max(0, Math.ceil(totalCount / 25) - 1));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: 1, minWidth: 0 }}>
      {/* Search Header */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Stack spacing={1.5}>
          <TextField
            size="small"
            fullWidth
            label="Search students"
            placeholder="Name, admission #, or roll #"
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <Iconify icon="solar:magnifer-linear" sx={{ mr: 1 }} />,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {selectedStudentIds.length} of {candidateCount} students selected · {totalCount}{' '}
            matching results
          </Typography>
        </Stack>

        <FormControlLabel
          labelPlacement="start"
          sx={{
            m: 0,
            px: 1,
            width: 1,
            justifyContent: 'space-between',
            '& .MuiFormControlLabel-label.Mui-disabled': { color: 'text.primary' },
          }}
          label="Select all results"
          control={
            <Checkbox
              size="small"
              checked={selectAllChecked}
              indeterminate={selectAllIndeterminate}
              onChange={handleSelectAllToggle}
              disabled={disabled || isLoading || matchingStudentIds.length === 0}
            />
          }
        />

        {/* Student List */}
        <Scrollbar ariaLabel="Available students" sx={{ flex: 1, minHeight: 0 }}>
          {isLoading ? (
            <Stack spacing={1}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          ) : filteredStudents.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Iconify icon="solar:user-search-line-duotone" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {emptyMessage ||
                  (localSearchQuery ? 'No students match your search' : 'No students available')}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {/* Individual Students */}
              {filteredStudents.map((student) => (
                <ListItem key={student.id} disablePadding>
                  <FormControlLabel
                    labelPlacement="start"
                    sx={{
                      m: 0,
                      py: 1,
                      px: 1,
                      width: 1,
                      gap: 1,
                      justifyContent: 'space-between',
                      '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 },
                      '& .MuiFormControlLabel-label.Mui-disabled': { color: 'text.primary' },
                    }}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        disabled={disabled}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {student.label}
                        </Typography>
                        <Typography component="div" variant="caption" color="text.secondary">
                          {student.grNumber && `GR #${student.grNumber}`}
                          {student.grNumber && student.rollNumber && ' • '}
                          {student.rollNumber && `Roll #${student.rollNumber}`}
                          {student.divisionName && ` • ${student.divisionName}`}
                        </Typography>
                      </Box>
                    }
                    disableTypography
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Scrollbar>
        {totalCount > 25 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={currentPage}
            rowsPerPage={25}
            rowsPerPageOptions={[25]}
            onPageChange={(_event, next) => onPageChange?.(next)}
          />
        )}
      </Paper>
    </Box>
  );
};

export default StudentSelectionLayout;
