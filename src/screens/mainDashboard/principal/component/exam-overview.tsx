import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

const ExamOverviewForPrincipal = () => {
  const examOverviewData = [
    {
      examName: 'Math Final',
      class: '10',
      division: 'A',
      date: '2025-02-12',
      status: 'Completed',
      type: 'Final',
      students: 50,
      passPercentage: 85,
    },
    {
      examName: 'Science Midterm',
      class: '9',
      division: 'B',
      date: '2025-02-15',
      status: 'Ongoing',
      type: 'Midterm',
      students: 45,
      passPercentage: null,
    },
    {
      examName: 'English Unit Test',
      class: '8',
      division: 'A',
      date: '2025-02-20',
      status: 'Upcoming',
      type: 'Unit Test',
      students: 60,
      passPercentage: null,
    },
    {
      examName: 'Physics Final',
      class: '12',
      division: 'C',
      date: '2025-02-10',
      status: 'Completed',
      type: 'Final',
      students: 40,
      passPercentage: 78,
    },
    {
      examName: 'History Midterm',
      class: '11',
      division: 'A',
      date: '2025-02-18',
      status: 'Ongoing',
      type: 'Midterm',
      students: 35,
      passPercentage: null,
    },
    {
      examName: 'Chemistry Unit Test',
      class: '10',
      division: 'B',
      date: '2025-02-25',
      status: 'Upcoming',
      type: 'Unit Test',
      students: 55,
      passPercentage: null,
    },
    {
      examName: 'Geography Final',
      class: '9',
      division: 'A',
      date: '2025-02-08',
      status: 'Completed',
      type: 'Final',
      students: 48,
      passPercentage: 82,
    },
    {
      examName: 'Computer Science Midterm',
      class: '12',
      division: 'B',
      date: '2025-02-16',
      status: 'Ongoing',
      type: 'Midterm',
      students: 38,
      passPercentage: null,
    },
    {
      examName: 'Biology Unit Test',
      class: '11',
      division: 'C',
      date: '2025-02-22',
      status: 'Upcoming',
      type: 'Unit Test',
      students: 42,
      passPercentage: null,
    },
    {
      examName: 'Economics Final',
      class: '10',
      division: 'A',
      date: '2025-02-05',
      status: 'Completed',
      type: 'Final',
      students: 50,
      passPercentage: 80,
    },
  ];

  return (
    <CustomizableTable
      tableId="exam-overview-for-principal"
      data={examOverviewData}
      columns={[
        { id: 'examName', label: 'Exam Name' },
        { id: 'class', label: 'Class' },
        { id: 'division', label: 'Division' },
        { id: 'date', label: 'Date' },
        {
          id: 'status',
          label: 'Status',
          render(value) {
            let color: LabelColor | undefined = 'warning';

            if (value === 'Completed') {
              color = 'success'; // Green for Completed
            } else if (value === 'Upcoming') {
              color = 'info'; // Blue for Upcoming
            }

            return <Label color={color}>{value}</Label>;
          },
        },
        { id: 'type', label: 'Type' },
        { id: 'students', label: 'Students' },
        { id: 'passPercentage', label: 'Pass Percentage' },
      ]}
    />
  );
};

export default ExamOverviewForPrincipal;
