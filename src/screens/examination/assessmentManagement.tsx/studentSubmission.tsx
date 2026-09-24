'use client';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Button, Checkbox, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import studentGradeData from 'src/json/academic/examination/studentGradeData.json';

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
          searchFieldProps={{
            placeholder: 'Search by Student Name, Assignments, Subject...',
            label: 'Search by Student Name, Assignments, Subject...',
          }}
          noDataText="No student submissions found"
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
              isFilter: false,
              isSort: false,
              render(value, row) {
                return (
                  <AdaptiveThreeDotsActions
                    actions={
                      row.status === 'Pending'
                        ? [
                            {
                              id: 'view',
                              label: 'View submission',
                              icon: 'mdi:eye',
                              onClick: () => {
                                viewSubmissionDialog.onTrue();
                                setSelectedStudent(row);
                              },
                            },
                          ]
                        : row.status === 'Submitted'
                          ? [
                              {
                                id: 'edit',
                                label: 'Edit submission',
                                icon: 'mdi:pen',
                                onClick: () => undefined,
                              },
                            ]
                          : []
                    }
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
