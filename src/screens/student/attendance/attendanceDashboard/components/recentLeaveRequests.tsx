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
    data={[]}
    noDataText="No leave requests found."
  />
);

export default RecentLeaveRequests;
