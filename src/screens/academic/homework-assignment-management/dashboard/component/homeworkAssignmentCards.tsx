'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetHomeworksQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';
import { useGetAssignmentsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';
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

interface HomeworkAssignmentCardsProps {
  standardId?: string;
  divisionId?: string;
  subjectId?: string;
}

const HomeworkAssignmentCards = ({
  standardId,
  divisionId,
  subjectId,
}: HomeworkAssignmentCardsProps) => {
  const [view, setView] = useState('assignment');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { data: homeworkData, isLoading: isLoadingHomework } = useGetHomeworksQuery(
    {
      academicMediumId: medium?.id,
      StandardId: standardId,
      DivisionId: divisionId,
      SubjectId: subjectId,
    },
    { skip: !medium?.id }
  );

  const { data: assignmentData, isLoading: isLoadingAssignment } = useGetAssignmentsQuery(
    {
      academicMediumId: medium?.id,
      StandardId: standardId,
      DivisionId: divisionId,
      SubjectId: subjectId,
    },
    { skip: !medium?.id }
  );

  const homeworkTableData = useMemo(() => {
    const raw: any[] =
      homeworkData?.data ??
      homeworkData?.items ??
      (Array.isArray(homeworkData) ? homeworkData : []);
    return raw.map((i: any) => ({
      homeworkTitle: i.title ?? i.name ?? '',
      publishedDate: i.startDate ?? i.createdAt ?? '',
      pendingStudents: i.pendingStudents ?? i.pendingCount ?? 0,
      dueDate: i.dueDate ?? i.endDate ?? '',
    }));
  }, [homeworkData]);

  const assignmentTableData = useMemo(() => {
    const raw: any[] = assignmentData?.items ?? [];
    return raw.map((i: any) => ({
      assignmentTitle: i.title ?? i.name ?? '',
      publishedDate: i.startDate ?? i.createdAt ?? '',
      pendingStudents: i.pendingStudents ?? i.pendingCount ?? 0,
      dueDate: i.dueDate ?? i.endDate ?? '',
    }));
  }, [assignmentData]);

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
            data={homeworkTableData}
            isLoading={isLoadingHomework}
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
            data={assignmentTableData}
            isLoading={isLoadingAssignment}
          />
        </>
      )}
    </Grid>
  );
};

export default HomeworkAssignmentCards;
