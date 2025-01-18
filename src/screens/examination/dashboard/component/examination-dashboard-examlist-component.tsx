'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { CalendarView } from 'src/sections/calendar/view';

const ExaminationDashboardExamlistComponent = (props: TabComponentType) => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignContent: 'center', mb: 2, justifyContent: 'space-between' }}>
        <Typography variant="h6">Upcoming and Completed Exam </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="small"
          onClick={() => {
            // setOpen(true);
          }}
        >
          Schedule Exam
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'subjectName', label: 'Subject Name' },
          { id: 'examName', label: 'Exam Name' },
          { id: 'marksEntry', label: 'Marks Entry' },
          { id: 'grade', label: 'Grade' },
          {
            id: 'status',
            label: 'Status',
            render: (value) => (
              <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showThreeDots={false}
                  placement="right-top"
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {}}
                  handleDeleteClick={() => {}}
                />
              );
            },
          },
        ]}
        data={[
          {
            class: '10th Grade',
            subjectName: 'Mathematics',
            examName: 'Mid-Term Exam',
            marksEntry: '50/100',
            grade: 'B',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '11th Grade',
            subjectName: 'Physics',
            examName: 'Final Exam',
            marksEntry: '85/100',
            grade: 'A',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '9th Grade',
            subjectName: 'English',
            examName: 'Quiz 1',
            marksEntry: '18/20',
            grade: 'A-',
            status: 'Pending',
            action: 'Edit',
          },
          {
            class: '12th Grade',
            subjectName: 'Chemistry',
            examName: 'Lab Test',
            marksEntry: '28/30',
            grade: 'A+',
            status: 'Pending',
            action: 'Review',
          },
          {
            class: '10th Grade',
            subjectName: 'History',
            examName: 'Term Paper',
            marksEntry: 'Not Available',
            grade: 'Pending',
            status: 'Scheduled',
            action: 'Cancel',
          },
        ]}
      />

      <Box display="flex" width="1215px" height="700px" ml="-40px">
        <CalendarView />
      </Box>
    </Box>
  );
};

export default ExaminationDashboardExamlistComponent;
