'use client';

import React from 'react';

import { Grid, Typography } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

const StudentProgressTable = () => (
  <Grid item xs={12}>
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
      Student Progress Table
    </Typography>
    <CustomizableTable
      tableId="studentProgressTable"
      columns={[
        { id: 'studentName', label: 'Student Name' },
        { id: 'corseProgress', label: 'Course Progress' },
        { id: 'participationRate', label: 'Participation Rate' },
        { id: 'averageGrade', label: 'Average Garde' },

        { id: 'actions', label: 'Actions' },
      ]}
      data={[]}
    />
  </Grid>
);

export default StudentProgressTable;
