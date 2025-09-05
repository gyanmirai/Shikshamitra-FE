'use client';

import dayjs from 'dayjs';
import React from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, MenuItem, MenuList, Typography, ListItemText } from '@mui/material';

const filteredData = [
  {
    title: 'Math Practice Problems',
    description: 'Solve problems from Chapter 5 on Linear Equations.',
    dueDate: null,
    dueTime: null,
    submissionType: 'Online',
    assignmentType: 'Practice Questions',
    topic: 'Linear Equations',
    assignedResources: 'Workbook Page 32-34',
    evaluationCriteria: '',
    customRubric: '',
  },
  {
    title: 'Science Project',
    description: 'Prepare a working model of the solar system.',
    dueDate: dayjs('2024-12-15'),
    dueTime: dayjs('23:59'),
    submissionType: 'In-Person',
    assignmentType: 'Project Work',
    topic: 'Solar System',
    assignedResources: 'Chapter 7: The Solar System',
    evaluationCriteria: 'Model Design, Explanation, Creativity',
    customRubric: 'Include all 8 planets with labels.',
  },
  {
    title: 'History Essay',
    description: 'Write an essay on the causes and effects of World War II.',
    dueDate: dayjs('2024-12-20'),
    dueTime: dayjs('23:59'),
    submissionType: 'Online',
    assignmentType: 'Essay Writing',
    topic: 'World War II',
    assignedResources: 'History Textbook Chapter 10',
    evaluationCriteria: 'Content, Structure, Grammar, and Relevance',
    customRubric: 'Include at least 3 major causes and their effects.',
  },
  {
    title: 'Geography Map Work',
    description: 'Mark and label the major rivers of India on the map.',
    dueDate: dayjs('2024-12-12'),
    dueTime: dayjs('18:00'),
    submissionType: 'In-Person',
    assignmentType: 'Map Work',
    topic: 'Indian Rivers',
    assignedResources: 'Map and Atlas',
    evaluationCriteria: '',
    customRubric: '',
  },
  {
    title: 'English Reading Task',
    description: 'Read and summarize Chapter 3 of your textbook.',
    dueDate: null,
    dueTime: null,
    submissionType: 'Online',
    assignmentType: 'Summary Writing',
    topic: 'Reading Comprehension',
    assignedResources: 'Textbook Chapter 3',
    evaluationCriteria: '',
    customRubric: '',
  },
];

const ViewAssignmentData = () => {
  const submissionDialog = useBoolean();

  return (
    <Box sx={{ p: 2 }}>
      <Scrollbar sx={{ height: '500px' }}>
        <CustomizableTable
          tableId="assignment-table"
          columns={[
            { id: 'title', label: 'Assignment Title', minWidth: '200px', align: 'left' },
            {
              id: 'description',
              label: 'Assignment Description',
              minWidth: '250px',
              align: 'left',
            },
            {
              id: 'dueDate',
              label: 'Due Date',
              minWidth: '130px',
              align: 'left',
              render: (value: any, row: any) => (
                <Typography fontSize="12px" gutterBottom>
                  {value ? dayjs(value).format('DD MMM YYYY') : '-'}
                </Typography>
              ),
            },
            {
              id: 'dueTime',
              label: 'Time',
              render: (value: any, row: any) => (
                <Typography fontSize="12px" gutterBottom>
                  {value ? dayjs(value).format('HH:mm') : '-'}
                </Typography>
              ),
            },
            { id: 'submissionType', label: 'Submission Type', minWidth: '200px', align: 'left' },
            { id: 'assignmentType', label: 'Assignment Type', minWidth: '200px', align: 'left' },
            { id: 'topic', label: 'Topic' },
            {
              id: 'assignedResources',
              label: 'Assigned Resources',
              minWidth: '200px',
              align: 'left',
            },
            {
              id: 'evaluationCriteria',
              label: 'Evaluation Criteria',
              minWidth: '200px',
              align: 'left',
            },
            { id: 'customRubric', label: 'Custom Rubric', minWidth: '180px', align: 'left' },
            {
              id: 'action',
              label: 'Action',
              render(value: any, row: any) {
                return (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={() => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            submissionDialog.onTrue();
                          }}
                        >
                          <Iconify icon="mdi:eye" />
                          <ListItemText>View Submission</ListItemText>
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={filteredData}
        />
      </Scrollbar>
    </Box>
  );
};

export default ViewAssignmentData;
