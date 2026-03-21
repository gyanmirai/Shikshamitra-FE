'use client';

import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import {
  Box,
  Grid,
  MenuList,
  MenuItem,
  Typography,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

const HomeworkAssignmentCards = () => {
  // const [hoveredResource, setHoveredResource] = useState<string | null>(null);
  const [view, setView] = useState('assignment');

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem>
            <Iconify icon="mdi:bell" />
            <ListItemText>Send Notification</ListItemText>
          </MenuItem>
        </MenuList>
      </>
    ),
    []
  );

  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
      if (newView !== null) {
        setView(newView);
      }
    },
    []
  );

  return (
    <Grid size={{ xs: 12 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <ToggleButtonGroup
          size="small"
          value={view}
          exclusive
          onChange={handleChangeView}
          sx={{
            '& .Mui-selected': {
              backgroundColor: 'black',
              color: 'white',
              '&:hover': {
                backgroundColor: 'black',
              },
            },
          }}
        >
          <ToggleButton value="assignment">
            <Iconify icon="mdi:assignment" mr={1} />
            <Typography variant="subtitle2">Assignment</Typography>
          </ToggleButton>
          <ToggleButton value="homework">
            <Iconify icon="mdi:book-open-page-variant" mr={1} />
            <Typography variant="subtitle2">Homework</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'homework' ? (
        <>
          <Typography variant="h6">Pending Homework Submission</Typography>
          <CustomizableTable
            tableId="pendingHomework-table"
            columns={[
              { id: 'homeworkTitle', label: 'Homework Title', align: 'left', filterType: 'string' },
              { id: 'publishedDate', label: 'Published Date', align: 'left', filterType: 'date' },
              {
                id: 'pendingStudents',
                label: 'Pending Students',
                align: 'left',
                filterType: 'number',
              },
              { id: 'dueDate', label: 'Due Date', align: 'left', filterType: 'date' },
              {
                id: 'actions',
                label: 'Actions',
                isSort: false,
                sticky: true,
                isFilter: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      actions={(prop) => actions({ ...prop, row })}
                      placement="right-top"
                    />
                  );
                },
              },
            ]}
            data={[
              {
                homeworkTitle: 'Math Homework 1',
                publishedDate: '2024-02-01',
                pendingStudents: 5,
                dueDate: '2024-02-10',
              },
              {
                homeworkTitle: 'Science Project',
                publishedDate: '2024-02-03',
                pendingStudents: 8,
                dueDate: '2024-02-12',
              },
              {
                homeworkTitle: 'History Essay',
                publishedDate: '2024-02-05',
                pendingStudents: 3,
                dueDate: '2024-02-15',
              },
              {
                homeworkTitle: 'English Literature Review',
                publishedDate: '2024-02-07',
                pendingStudents: 10,
                dueDate: '2024-02-18',
              },
              {
                homeworkTitle: 'Physics Lab Report',
                publishedDate: '2024-02-08',
                pendingStudents: 6,
                dueDate: '2024-02-20',
              },
            ]}
          />
        </>
      ) : (
        <>
          <Typography variant="h6">Pending Assignment Submission</Typography>
          <CustomizableTable
            tableId="pendingAssignment-table"
            columns={[
              {
                id: 'assignmentTitle',
                label: 'Assignment Title',
                align: 'left',
                filterType: 'string',
              },
              { id: 'publishedDate', label: 'Published Date', align: 'left', filterType: 'date' },
              {
                id: 'pendingStudents',
                label: 'Pending Students',
                align: 'left',
                filterType: 'number',
              },
              { id: 'dueDate', label: 'Due Date', align: 'left', filterType: 'date' },
              {
                id: 'actions',
                label: 'Actions',
                isSort: false,
                sticky: true,
                isFilter: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      actions={(prop) => actions({ ...prop, row })}
                      placement="right-top"
                    />
                  );
                },
              },
            ]}
            data={[
              {
                assignmentTitle: 'Math Homework 1',
                publishedDate: '2024-02-01',
                pendingStudents: 5,
                dueDate: '2024-02-10',
              },
              {
                assignmentTitle: 'Science Project',
                publishedDate: '2024-02-03',
                pendingStudents: 8,
                dueDate: '2024-02-12',
              },
              {
                assignmentTitle: 'History Essay',
                publishedDate: '2024-02-05',
                pendingStudents: 3,
                dueDate: '2024-02-15',
              },
              {
                assignmentTitle: 'English Literature Review',
                publishedDate: '2024-02-07',
                pendingStudents: 10,
                dueDate: '2024-02-18',
              },
              {
                assignmentTitle: 'Physics Lab Report',
                publishedDate: '2024-02-08',
                pendingStudents: 6,
                dueDate: '2024-02-20',
              },
            ]}
          />
        </>
      )}
    </Grid>
  );
};

export default HomeworkAssignmentCards;
