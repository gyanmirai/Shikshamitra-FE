import React from 'react';

import { Box, Chip, Switch, MenuList, MenuItem } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const QuizTable = ({ data, addQuizDialog, onTogglePublish, onAttemptClick, handleDelete }: any) => {
  const actions = ({ row, popover }: any) => (
    <Box>
      <MenuList>
        <MenuItem onClick={() => onAttemptClick(row)}>
          <Iconify icon="fluent:quiz-new-20-filled" sx={{ height: '16px', width: '16px' }} />
          Attempt Quiz
        </MenuItem>
      </MenuList>
    </Box>
  );

  return (
    <CustomizableTable
      tableId="quiz-table"
      searchFieldProps={{
        placeholder: 'Search by Class, Division, Subject...',
        label: 'Search by Class, Division, Subject...',
      }}
      noDataText={
        <>
          No Quiz Data Found{' '}
          <Box
            onClick={() => {
              addQuizDialog.onTrue();
            }}
            color="primary.main"
            fontWeight={600}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
          >
            Create Slots
          </Box>
        </>
      }
      columns={[
        { id: 'class', label: 'Class' },
        {
          id: 'division',
          label: 'Division',
          render(value, row) {
            return (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value?.length
                  ? value.map((item: string) => (
                      <Chip key={item} label={item} size="small" variant="outlined" />
                    ))
                  : '-'}
              </Box>
            );
          },
        },
        { id: 'subject', label: 'Subject' },
        { id: 'quizTitle', label: 'Quiz Title', minWidth: '130px', align: 'left' },
        { id: 'createdAt', label: 'Created At', minWidth: '150px', align: 'left' },
        { id: 'quizDate', label: 'Quiz Date', minWidth: '130px', align: 'left' },
        { id: 'quizTime', label: 'Quiz Time', minWidth: '130px', align: 'left' },
        { id: 'quizEndDate', label: 'Quiz End Date', minWidth: '200px', align: 'left' },
        { id: 'quizEndTime', label: 'Quiz End Time', minWidth: '200px', align: 'left' },
        { id: 'quizDuration', label: 'Quiz Duration', minWidth: '200px', align: 'left' },
        { id: 'attemptsAllow', label: 'Attempts Allow', minWidth: '200px', align: 'left' },
        { id: 'totalMarks', label: 'Total Marks', minWidth: '200px', align: 'left' },
        { id: 'passingMarks', label: 'Passing Marks', minWidth: '200px', align: 'left' },
        {
          id: 'status',
          label: 'Publish',
          render(value: boolean, row: any) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch size="small" checked={value} onChange={() => onTogglePublish(row)} />
              </Box>
            );
          },
        },
        {
          id: 'actions',
          label: 'Actions',
          isSort: false,
          sticky: true,
          isFilter: false,
          minWidth: 100,
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={(props) => actions({ ...props, row })}
                placement="right-top"
                showEditIcon
                showDeleteIcon
                handleEditClick={() => {
                  addQuizDialog.onTrue();
                }}
                handleDeleteClick={() => {
                  handleDelete(row.id);
                }}
              />
            );
          },
        },
      ]}
      data={data}
    />
  );
};

export default QuizTable;
