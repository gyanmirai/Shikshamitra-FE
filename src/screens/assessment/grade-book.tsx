import React from 'react';
import CustomizableTable from 'src/components/customizable-table';

const GradeBook = () => (
  <CustomizableTable
    tableId="grade-book"
    columns={[
      { id: 'assessmentName', label: 'Assessment Name' },
      { id: 'class', label: 'Class' },
      { id: 'subject', label: 'Subject' },
      { id: 'completedDate', label: 'Completed Date' },

      { id: 'status', label: 'Status' },
      { id: 'action', label: 'Action' },
    ]}
    data={[]}
  />
);

export default GradeBook;
