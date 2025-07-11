import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

const RecentLeaveRequests = () => (
  <CustomizableTable
    tableId="allBirthdayWithDate"
    columns={[
      { id: 'studentName', label: 'Student Name' },
      { id: 'class', label: 'Class' },
      { id: 'division', label: 'Division' },
      { id: 'rollNo', label: 'Roll no.' },
      { id: 'dateRange', label: 'Date Range' },
      { id: 'reason', label: 'Reason' },
    ]}
    data={[
      {
        studentName: 'Solanki Mayur',
        class: '07',
        division: 'A',
        rollNo: '12',
        dateRange: '28-06-2025 to 30-06-2025',
        reason: 'Family Function',
      },
      {
        studentName: 'Kanwar Rajan',
        class: '08',
        division: 'B',
        rollNo: '46',
        dateRange: '28-06-2025 to 30-06-2025',
        reason: 'Medical Appointment',
      },
      {
        studentName: 'Jinjala Dharmik',
        class: '01',
        division: 'A',
        rollNo: '11',
        dateRange: '28-06-2025 to 30-06-2025',
        reason: 'Personal Work',
      },
      {
        studentName: 'Makvana Vishal',
        class: '10',
        division: 'C',
        rollNo: '02',
        dateRange: '28-06-2025 to 30-06-2025',
        reason: 'Sick Leave',
      },
    ]}
  />
);

export default RecentLeaveRequests;
