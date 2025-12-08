import React from 'react';
import { Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { ScheduleExamStatus } from 'src/enums/schedule-exam-status';

const AcademicDashboardExams = () => (
  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Typography variant="h6">Upcoming Exam</Typography>
    <CustomizableTable
      tableId="nextExams"
      columns={[
        { id: 'subject', label: 'Subject' },
        { id: 'class', label: 'Class' },
        { id: 'date', label: 'Date' },
      ]}
      data={[
        {
          subject: 'Mathematics',
          class: '10-A',
          date: '15-06-2025',
          status: ScheduleExamStatus.Completed, // 5 (Ongoing in UI)
        },
        {
          subject: 'Physics',
          class: '11',
          date: '15-07-2025',
          status: ScheduleExamStatus.Published, // 2 (Scheduled)
        },
        {
          subject: 'Chemistry',
          class: '12-B',
          date: '24-06-2025',
          status: ScheduleExamStatus.Completed, // 5 (Ongoing)
        },
        {
          subject: 'English',
          class: '10',
          date: '01-11-2025',
          status: ScheduleExamStatus.Published, // 2 (Scheduled)
        },
        {
          subject: 'Gujarati',
          class: '9-A',
          date: '01-12-2025',
          status: ScheduleExamStatus.Published, // 2 (Scheduled)
        },
      ]}
    />
  </Card>
);

export default AcademicDashboardExams;
