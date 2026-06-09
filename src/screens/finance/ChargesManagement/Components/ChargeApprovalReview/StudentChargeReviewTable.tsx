'use client';

import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Stack,
  Table,
  Paper,
  TableRow,
  Checkbox,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import type { IStudentChargeReviewTableProps } from './types';

/**
 * StudentChargeReviewTable Component
 * Displays list of students in charge approval review with checkbox selection
 */
const StudentChargeReviewTable: React.FC<IStudentChargeReviewTableProps> = ({
  students,
  selectedStudentIds,
  onStudentSelect,
  onSearchChange,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (onSearchChange) {
        onSearchChange(query);
      }
    },
    [onSearchChange]
  );

  const handleCheckboxChange = useCallback(
    (studentId: string, isChecked: boolean) => {
      if (onStudentSelect) {
        onStudentSelect(studentId, isChecked);
      }
    },
    [onStudentSelect]
  );

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;

    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.studentName?.toLowerCase().includes(query) ||
        student.grNumber?.toString().includes(query) ||
        student.rollNumber?.toString().includes(query)
    );
  }, [students, searchQuery]);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <Iconify
          icon="solar:users-group-rounded-bold-duotone"
          width={18}
          sx={{ color: 'primary.main' }}
        />
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Student List
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Review and manage students for this charge approval
          </Typography>
        </Box>
      </Stack>

      {/* Search Bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, GR number, or roll number..."
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <Iconify icon="carbon:search" sx={{ mr: 1, color: 'text.disabled' }} />,
          },
        }}
        sx={{ mb: 2 }}
      />

      {/* Students Table */}
      <TableContainer sx={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ '& th': { backgroundColor: 'action.hover', fontWeight: 700 } }}>
              <TableCell align="center" sx={{ minWidth: 50 }}>
                <Checkbox
                  indeterminate={
                    selectedStudentIds.length > 0 && selectedStudentIds.length < students.length
                  }
                  checked={students.length > 0 && selectedStudentIds.length === students.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all
                      students.forEach((student) => {
                        if (!selectedStudentIds.includes(student.studentId)) {
                          handleCheckboxChange(student.studentId, true);
                        }
                      });
                    } else {
                      // Deselect all
                      students.forEach((student) => {
                        if (selectedStudentIds.includes(student.studentId)) {
                          handleCheckboxChange(student.studentId, false);
                        }
                      });
                    }
                  }}
                />
              </TableCell>
              <TableCell align="left" sx={{ minWidth: 150 }}>
                Student Name
              </TableCell>
              <TableCell align="left" sx={{ minWidth: 100 }}>
                GR Number
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 80 }}>
                Roll No.
              </TableCell>
              <TableCell align="left" sx={{ minWidth: 100 }}>
                Class
              </TableCell>
              <TableCell align="left" sx={{ minWidth: 100 }}>
                Division
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  <Typography variant="caption">No students found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow
                  key={student.studentId}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell align="center">
                    <Checkbox
                      checked={selectedStudentIds.includes(student.studentId)}
                      onChange={(e) => handleCheckboxChange(student.studentId, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <Typography variant="caption" fontSize="13px">
                      {student.studentName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography variant="caption" fontSize="13px">
                      {student.grNumber || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" fontSize="13px">
                      {student.rollNumber || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography variant="caption" fontSize="13px">
                      {student.standardName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography variant="caption" fontSize="13px">
                      {student.divisionName || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Student Count */}
      <Box sx={{ mt: 2, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Total Students: <strong>{students.length}</strong> | Selected:{' '}
          <strong>{selectedStudentIds.length}</strong>
        </Typography>
      </Box>
    </Paper>
  );
};

export default StudentChargeReviewTable;
