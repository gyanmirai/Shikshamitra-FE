'use client';

import React, { useState } from 'react';

import { Box, Button, MenuList, MenuItem, Checkbox, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import studentGradeData from 'src/json/academic/examination/studentGradeData.json';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { AssignGrade } from './assignGradeForm';

import type { IStudentGrade } from './type';

const StudentSubmissions = () => {
  // State to store the currently selected student
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  // State to store the table data with student grades
  const [tableData, setTableData] = useState<IStudentGrade[]>(studentGradeData);
  // State to store array of selected student IDs for bulk operations
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Dialog control states for different modals
  const dialog = useBoolean();
  const viewSubmissionDialog = useBoolean();
  const bulkGradeDialog = useBoolean();

  // Handles the selection/deselection of individual students
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  // Updates grades and feedback for multiple selected students at once
  const handleBulkGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        selectedStudents.includes(student.id)
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
      )
    );
    bulkGradeDialog.onFalse();
    setSelectedStudents([]);
  };

  // Updates grade and feedback for a single selected student
  const handleSingleGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        student.id === selectedStudent?.id
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
      )
    );
    dialog.onFalse();
    setSelectedStudent(null);
  };

  // Closes the view submission dialog and resets selected student
  const handleCloseDialog = () => {
    setSelectedStudent(null);
    viewSubmissionDialog.onFalse();
  };
  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:pencil" />}
          disabled={selectedStudents.length === 0}
          onClick={bulkGradeDialog.onTrue}
        >
          Bulk Grade ({selectedStudents.length} selected)
        </Button>
      </Box>

      <Scrollbar sx={{ p: 2, height: '500px' }}>
        <CustomizableTable
          tableId="student-submissions"
          columns={[
            {
              id: 'select',
              label: 'Select',
              render: (value, row: any) => (
                <Checkbox
                  checked={selectedStudents.includes(row.id)}
                  onChange={() => handleSelectStudent(row.id)}
                />
              ),
            },
            { id: 'studentName', label: 'Student Name' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'subject', label: 'Subject' },
            {
              id: 'grade',
              label: 'Grade',
              render: (value, row) =>
                value === '' ? (
                  <Typography variant="subtitle2" color="textSecondary">
                    -
                  </Typography>
                ) : (
                  <Typography variant="caption" gutterBottom>
                    {value}
                  </Typography>
                ),
            },
            {
              id: 'feedback',
              label: 'Feedback',
              render: (value, row) =>
                value === '' ? (
                  <Typography variant="subtitle2" color="textSecondary">
                    -
                  </Typography>
                ) : (
                  <Typography variant="caption" gutterBottom>
                    {value}
                  </Typography>
                ),
            },
            { id: 'weightedAverage', label: 'Weighted Average' },
            {
              id: 'status',
              label: 'Status',
              render: (value, row) => (
                <Label
                  color={
                    value === 'Submitted'
                      ? 'primary'
                      : value === 'Pending'
                        ? 'warning'
                        : value === 'Overdue'
                          ? 'error'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              ),
            },
            {
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={() => (
                      <MenuList>
                        {row.status === 'Pending' && (
                          <MenuItem
                            onClick={() => {
                              viewSubmissionDialog.onTrue();
                              setSelectedStudent(row);
                            }}
                          >
                            {' '}
                            <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                            View Submission
                          </MenuItem>
                        )}

                        {row.status === 'Submitted' && (
                          <MenuItem onClick={() => {}}>
                            {' '}
                            <Iconify icon="mdi:pen" sx={{ height: '16px', width: '16px' }} />
                            Edit
                          </MenuItem>
                        )}
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />

        <CustomDialog
          open={viewSubmissionDialog.value}
          handleClose={handleCloseDialog}
          title="Assign Grade"
          maxWidth="md"
        >
          <AssignGrade
            isBulk={false}
            data={selectedStudent}
            onSubmit={handleSingleGradeAssignment}
          />
        </CustomDialog>

        <CustomDialog
          open={bulkGradeDialog.value}
          handleClose={bulkGradeDialog.onFalse}
          title={`Assign Grade to ${selectedStudents.length} Students`}
        >
          <AssignGrade isBulk onSubmit={handleBulkGradeAssignment} />
        </CustomDialog>
      </Scrollbar>
    </Box>
  );
};
export default StudentSubmissions;
