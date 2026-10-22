'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Paper, Checkbox, Typography } from '@mui/material';

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
  const handleCheckboxChange = useCallback(
    (studentId: string, isChecked: boolean) => {
      if (onStudentSelect) {
        onStudentSelect(studentId, isChecked);
      }
    },
    [onStudentSelect]
  );

  const handleSelectAll = useCallback(
    (isChecked: boolean) => {
      students.forEach((student) => {
        const isSelected = selectedStudentIds.includes(student.studentId);
        if (isChecked && !isSelected) {
          handleCheckboxChange(student.studentId, true);
        }
        if (!isChecked && isSelected) {
          handleCheckboxChange(student.studentId, false);
        }
      });
    },
    [students, selectedStudentIds, handleCheckboxChange]
  );

  const tableRows = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        isSelected: selectedStudentIds.includes(student.studentId),
      })),
    [students, selectedStudentIds]
  );

  const columns: IColumn[] = useMemo(() => {
    const allSelected = students.length > 0 && selectedStudentIds.length === students.length;
    const someSelected = selectedStudentIds.length > 0 && !allSelected;

    return [
      {
        cellSx: { textAlign: 'center' as const },
        id: 'isSelected',
        label: (
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        align: 'left',
        isSort: false,
        isFilter: false,
        width: 70,
        render: (value, row) => (
          <Checkbox
            checked={Boolean(value)}
            onChange={(e) => handleCheckboxChange(row.studentId, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      { id: 'studentName', label: 'Student Name', align: 'left' },
      { id: 'grNumber', label: 'GR Number', align: 'left', filterType: 'number' },
      { id: 'rollNumber', label: 'Roll No.', align: 'left', filterType: 'number' },
      { id: 'standardName', label: 'Class', align: 'left' },
      { id: 'divisionName', label: 'Division', align: 'left' },
    ];
  }, [students, selectedStudentIds.length, handleSelectAll, handleCheckboxChange]);

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

      <CustomizableTable
        tableId="charge-approval-review-student-table"
        tableTitle="Student List"
        columns={columns}
        data={tableRows}
        isFilter={false}
        isPagination={false}
        isSearch
        isLoading={isLoading}
        serverSideSearch={Boolean(onSearchChange)}
        onServerSearch={onSearchChange}
        searchFieldProps={{
          placeholder: 'Search by name, GR number, or roll number...',
        }}
        noDataText="No students found"
        wrapperProps={{
          minHeight: 320,
        }}
      />

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
