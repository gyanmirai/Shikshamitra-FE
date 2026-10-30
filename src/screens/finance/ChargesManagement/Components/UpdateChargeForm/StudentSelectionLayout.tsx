'use client';

import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
  divisionFilter?: string;
  totalCount?: number;
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
  divisionFilter,
  totalCount = students.length,
  disabled = false,
  emptyMessage,
}) => {
  const localSearchQuery = searchQuery;
  const handleSearchChange = (query: string) => onSearchChange?.(query);
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [searchQuery, divisionFilter, students]);
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

  // Filter students based on search
  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch =
          !localSearchQuery ||
          student.label.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
          student.grNumber?.toString().includes(localSearchQuery) ||
          student.rollNumber?.toString().includes(localSearchQuery);

        const matchesDivision = !divisionFilter || student.divisionName === divisionFilter;

        return matchesSearch && matchesDivision;
      }),
    [students, localSearchQuery, divisionFilter]
  );

  // Handle select all toggle
  const handleSelectAllToggle = useCallback(() => {
    onSelectionChange(
      toggleFilteredStudents(
        selectedStudentIds,
        filteredStudents.map((s) => s.id)
      )
    );
  }, [filteredStudents, selectedStudentIds, onSelectionChange]);

  const selectAllChecked = useMemo(
    () =>
      filteredStudents.length > 0 &&
      filteredStudents.every((s) => selectedStudentIds.includes(s.id)),
    [filteredStudents, selectedStudentIds]
  );

  const selectAllIndeterminate =
    !selectAllChecked &&
    filteredStudents.some((student) => selectedStudentIds.includes(student.id));

  const currentPage = Math.min(page, Math.max(0, Math.ceil(filteredStudents.length / 25) - 1));

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
            {selectedStudentIds.length} of {totalCount} students selected ·{' '}
            {filteredStudents.length} matching results
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
              disabled={disabled || isLoading || filteredStudents.length === 0}
            />
          }
        />

        {/* Student List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
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
              {filteredStudents.slice(currentPage * 25, (currentPage + 1) * 25).map((student) => (
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
        </Box>
        {filteredStudents.length > 25 && (
          <TablePagination
            component="div"
            count={filteredStudents.length}
            page={currentPage}
            rowsPerPage={25}
            rowsPerPageOptions={[25]}
            onPageChange={(_event, next) => setPage(next)}
          />
        )}
      </Paper>
    </Box>
  );
};

export default StudentSelectionLayout;
