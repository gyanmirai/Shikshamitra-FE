'use client';

import { useState, useCallback } from 'react';

import { Box, MenuList, MenuItem, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const Assignments = () => {
  const uploadAssignmentDialog = useBoolean();
  const [subject, setSubject] = useState('');
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              uploadAssignmentDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:upload" />
            Upload Assignment
          </MenuItem>
        </MenuList>
      </>
    ),
    [uploadAssignmentDialog]
  );
  return (
    <Box>
      <CustomSelect
        label="Course/Subject"
        options={[
          {
            value: 'Math',
            label: 'Math',
          },
          {
            value: 'English',
            label: 'English',
          },
        ]}
        value={subject}
        onChange={(val) => {
          setSubject(val as string);
        }}
        formControlProps={{ sx: { minWidth: 200 } }}
      />
      <CustomizableTable
        tableId="assignment-table"
        columns={[
          { id: 'subjectName', label: 'Subject Name', minWidth: '150px', align: 'left' },
          { id: 'assignmentType', label: 'Assignment Type', minWidth: '170px', align: 'left' },
          { id: 'assignmentName', label: 'Assignment Name', minWidth: '180px', align: 'left' },
          { id: 'assignedTeacher', label: 'Assigned Teacher', minWidth: '180px', align: 'left' },
          { id: 'dueDate', label: 'Due Date', minWidth: '130px', align: 'left' },
          { id: 'completionDate', label: 'Completion Date', minWidth: '180px', align: 'left' },
          {
            id: 'gradeFeedback',
            label: 'Grade & Feedback',
            minWidth: '180px',
            align: 'left',
            render(value, row) {
              return (
                <>
                  {value.grade && value.feedback ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Label
                        color={
                          value?.grade === 'A'
                            ? 'success'
                            : value?.grade === 'B'
                              ? 'success'
                              : value?.grade === 'C'
                                ? 'warning'
                                : 'error'
                        }
                      >
                        {value?.grade}
                      </Label>
                      <Typography variant="caption" sx={{ opacity: 0.84 }}>
                        {value?.feedback}
                      </Typography>
                    </Box>
                  ) : (
                    '-'
                  )}
                </>
              );
            },
          },
          {
            id: 'submissionStatus',
            label: 'Submission Status',
            minWidth: '180px',
            align: 'left',
            render(value, row) {
              return (
                <Label
                  color={
                    value === 'Submitted' ? 'success' : value === 'Pending' ? 'warning' : 'error'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            subjectName: 'Math',
            assignmentType: 'Homework',
            assignmentName: 'Algebra Basics',
            assignedTeacher: 'Mr. Smith',
            dueDate: '01-01-2024',
            completionDate: '01-01-2024',
            gradeFeedback: {
              grade: 'A',
              feedback: 'Excellent',
            },
            submissionStatus: 'Submitted',
          },
          {
            subjectName: 'Science',
            assignmentType: 'Lab Report',
            assignmentName: 'Chemical Reactions',
            assignedTeacher: 'Dr. Johnson',
            dueDate: '01-01-2024',
            gradeFeedback: {
              grade: '',
              feedback: '',
            },
            submissionStatus: 'Pending',
          },
          {
            subjectName: 'English',
            assignmentType: 'Essay',
            assignmentName: 'Shakespeare Analysis',
            assignedTeacher: 'Ms. Williams',
            dueDate: '01-01-2024',
            gradeFeedback: {
              grade: '',
              feedback: '',
            },
            submissionStatus: 'Overdue',
          },
          {
            subjectName: 'Math',
            assignmentType: 'Project',
            assignmentName: 'Geometry Tutorials',
            assignedTeacher: 'Mr. Smith',
            dueDate: '01-01-2024',
            completionDate: '01-01-2024',
            gradeFeedback: {
              grade: 'A',
              feedback: 'Excellent',
            },
            submissionStatus: 'Submitted',
          },
        ]}
      />
    </Box>
  );
};

export default Assignments;
