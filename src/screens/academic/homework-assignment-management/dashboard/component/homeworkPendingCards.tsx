'use client';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

export const assignmentData = [
  {
    title: 'Math Assignment 1',
    pending: 10,
    status: 'Completed',
    lastDate: '2024-12-10',
  },
  {
    title: 'Science Experiment Report',
    pending: 17,
    status: 'Review',
    lastDate: '2024-12-15',
  },
  {
    title: 'History Project',
    pending: 18,
    status: 'Pending',
    lastDate: '2024-12-20',
  },
  {
    title: 'English Essay',
    pending: 20,
    status: 'Review',
    lastDate: '2024-12-25',
  },
  {
    title: 'Geography Map Work',
    pending: 8,
    status: 'Completed',
    lastDate: '2024-12-30',
  },
];

const HomeworkPendingCards = () => {
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  return (
    <Grid container spacing={2} mt={1}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">My Assignments</Typography>
        <CustomizableTable
          tableId="assignment-table"
          columns={[
            { id: 'assignmentTitle', label: 'Assignment Title', minWidth: '180px', align: 'left' },
            { id: 'publishedDate', label: 'Published Date', minWidth: '170px', align: 'left' },
            { id: 'dueDate', label: 'Due Date', minWidth: '150px', align: 'left' },
            {
              id: 'status',
              label: 'Status',
              render(value, row) {
                return (
                  <Label
                    variant="soft"
                    color={
                      value === 'Pending' ? 'error' : value === 'Completed' ? 'success' : 'default'
                    }
                  >
                    {value}
                  </Label>
                );
              },
            },
            {
              id: 'assignmentCheckStatus',
              label: 'Assignment Check Status',
              minWidth: '240px',
              align: 'left',
              render(value, row) {
                return (
                  <Label
                    variant="soft"
                    color={
                      value === 'Pending' ? 'error' : value === 'Completed' ? 'success' : 'default'
                    }
                  >
                    {value}
                  </Label>
                );
              },
            },
            { id: 'grade', label: 'Grade' },
          ]}
          data={[
            {
              assignmentTitle: 'Math Homework 1',
              publishedDate: '2024-02-01',
              dueDate: '2024-02-10',
              status: 'Completed',
              assignmentCheckStatus: 'Completed',
              grade: 'A',
            },
            {
              assignmentTitle: 'Science Project',
              publishedDate: '2024-02-03',
              dueDate: '2024-02-12',
              status: 'Pending',
              assignmentCheckStatus: 'Pending',
              grade: '',
            },
            {
              assignmentTitle: 'History Essay',
              publishedDate: '2024-02-05',
              dueDate: '2024-02-15',
              status: 'Completed',
              assignmentCheckStatus: 'Completed',
              grade: 'B+',
            },
            {
              assignmentTitle: 'English Literature Review',
              publishedDate: '2024-02-07',
              dueDate: '2024-02-18',
              status: 'Completed',
              assignmentCheckStatus: 'Completed',
              grade: 'A-',
            },
            {
              assignmentTitle: 'Physics Lab Report',
              publishedDate: '2024-02-08',
              dueDate: '2024-02-20',
              status: 'Pending',
              assignmentCheckStatus: 'Pending',
              grade: '',
            },
          ]}
        />
      </Grid>
    </Grid>
  );
};

export default HomeworkPendingCards;
