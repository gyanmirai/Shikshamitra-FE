import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  ScheduleExamStatus,
  ScheduleExamStatusColor,
  ScheduleExamStatusOptions,
} from 'src/enums/schedule-exam-status';

const AcademicDashboardExams = () => (
  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Typography variant="h6">Next 5 Exams</Typography>
    <CustomizableTable
      tableId="nextExams"
      columns={[
        { id: 'examName', label: 'Exam Name' },
        { id: 'subject', label: 'Subject' },
        { id: 'class', label: 'Class' },
        { id: 'date', label: 'Date' },
        {
          id: 'status',
          label: 'Status',
          minWidth: 80,
          sticky: true,
          filterType: 'enum',
          enumOptions: ScheduleExamStatusOptions,
          align: 'left',
          render(value, row) {
            const color = ScheduleExamStatusColor[value as ScheduleExamStatus] as LabelColor;
            return <Label color={color}>{ScheduleExamStatus[value]}</Label>;
          },
        },
      ]}
      data={[
        {
          examName: 'Unit Test 1',
          subject: 'Mathematics',
          class: '10-A',
          date: '15-06-2025',
          status: ScheduleExamStatus.Completed, // 5 (Ongoing in UI)
        },
        {
          examName: 'Unit Test 2',
          subject: 'Physics',
          class: '11',
          date: '15-07-2025',
          status: ScheduleExamStatus.Published, // 2 (Scheduled)
        },
        {
          examName: 'Unit Test 3',
          subject: 'Chemistry',
          class: '12-B',
          date: '24-06-2025',
          status: ScheduleExamStatus.Completed, // 5 (Ongoing)
        },
        {
          examName: 'Unit Test 4',
          subject: 'English',
          class: '10',
          date: '01-11-2025',
          status: ScheduleExamStatus.Published, // 2 (Scheduled)
        },
        {
          examName: 'Unit Test 5',
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
