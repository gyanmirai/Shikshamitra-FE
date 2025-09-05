'use client';

import React from 'react';
import { Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

const AssignmentTable = () => (
  <Grid size={12}>
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
      Assignment Table
    </Typography>
    <CustomizableTable
      tableId="assignmentTable"
      columns={[
        { id: 'assignmentName', label: 'Assignment Name' },
        { id: 'dueDate', label: 'Due Date' },
        { id: 'submissionRate', label: 'Submission Rate' },
        { id: 'averageGrade', label: 'Average Garde' },
        { id: 'overdueStatus', label: 'Overdue Status' },
        { id: 'actions', label: 'Actions' },
      ]}
      data={[]}
    />
  </Grid>
);

export default AssignmentTable;
