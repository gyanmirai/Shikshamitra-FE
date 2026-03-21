import React from 'react';
import CustomizableTable from 'src/components/customizable-table';

const PendingAssessment = () => (
  <CustomizableTable
    tableId="pending-assessment"
    columns={[
      { id: 'assessmentName', label: 'Assessment Name' },
      { id: 'subject', label: 'Subject' },
      { id: 'dueDate', label: 'Due Date' },
      { id: 'submission', label: 'Submission' },
      { id: 'status', label: 'Status' },
      { id: 'action', label: 'Action' },
    ]}
    data={[]}
  />
);

export default PendingAssessment;
