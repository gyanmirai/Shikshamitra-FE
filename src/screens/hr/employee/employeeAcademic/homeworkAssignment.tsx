import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React from 'react';
import { Label } from 'src/components/label';
import { Box, Card, Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';

const HomeworkAssignment = () => (
  <Grid container spacing={2}>
    <Grid size={12}>
      <Card sx={{ p: 2, height: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Homeworks</Typography>
        </Box>
        <CustomizableTable
          tableId="homework-assignment-management"
          // Custom no data message with action to create new homework
          noDataText={
            <>
              No Homework Created
              <Box
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
                Create Homework
              </Box>
            </>
          }
          columns={[
            {
              id: 'title',
              label: 'Homework Title',
              align: 'left',
              filterType: 'string',
            },
            {
              id: 'homeworkType',
              label: 'Homework Type',
              align: 'left',
              filterType: 'string',
            },
            {
              id: 'startDate',
              label: 'Start Date Time',
              align: 'left',
              filterType: 'date',
              render: (value) => (
                <Typography fontSize="12px" gutterBottom>
                  {value ? dayjs(value).format('DD-MM-YYYY hh:mm') : '-'}
                </Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date Time',
              align: 'left',
              filterType: 'date',
              render: (value) => (
                <Typography fontSize="12px" gutterBottom>
                  {value ? dayjs(value).format('DD-MM-YYYY hh:mm') : '-'}
                </Typography>
              ),
            },
            {
              id: 'submissionType',
              label: 'Submission Type',
              align: 'left',
            },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              isFilter: false,
              sticky: true,
              isSort: false,
              filterType: 'enum',
              enumOptions: PublishUnpublishStatusOptions,
              render(value, row) {
                const color = PublishUnpublishStatusTypeColors[
                  value as PublishUnpublishStatusType
                ] as LabelColor;
                return <Label color={color}>{PublishUnpublishStatusType[value]}</Label>;
              },
            },
          ]}
          data={[
            {
              id: '1',
              title: 'Math Practice Worksheet',
              homeworkType: 'Worksheet',
              startDate: '2025-05-25T09:00:00',
              endDate: '2025-05-27T17:00:00',
              submissionType: 'Online Upload',
              status: 1, // PUBLISHED
            },
            {
              id: '2',
              title: 'Science Chapter Summary',
              homeworkType: 'Summary',
              startDate: '2025-05-26T10:00:00',
              endDate: '2025-05-28T15:00:00',
              submissionType: 'In-Class Submission',
              status: 0, // DRAFT
            },
            {
              id: '3',
              title: 'English Essay Writing',
              homeworkType: 'Essay',
              startDate: '2025-05-27T08:30:00',
              endDate: '2025-05-29T12:00:00',
              submissionType: 'Online Upload',
              status: 1,
            },
            {
              id: '4',
              title: 'History Timeline Assignment',
              homeworkType: 'Project',
              startDate: '2025-05-28T09:15:00',
              endDate: '2025-05-30T16:00:00',
              submissionType: 'In-Class Presentation',
              status: 0,
            },
          ]}
        />
      </Card>
    </Grid>
    <Grid size={12}>
      <Card sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6">Assignments</Typography>
        <CustomizableTable
          tableId="assignment-management"
          noDataText={
            <>
              No Assignments Created
              <Box
                color="primary.main"
                fontWeight={600}
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    color: 'primary.dark',
                  },
                }}
              >
                Create Assignment
              </Box>
            </>
          }
          columns={[
            {
              id: 'title',
              label: 'Assignment Title',
              align: 'left',
              filterType: 'string',
            },
            {
              id: 'assignmentType',
              label: 'Assignment Type',
              align: 'left',
              filterType: 'string',
            },
            {
              id: 'startDate',
              label: 'Start Date Time',
              align: 'left',
              filterType: 'date',
              render: (value: string | Date | undefined) => (
                <Typography fontSize="12px" gutterBottom>
                  {value ? dayjs(value).format('DD-MM-YYYY hh:mm') : '-'}
                </Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date Time',
              align: 'left',
              filterType: 'date',
              render: (value: string | Date | undefined) => (
                <Typography fontSize="12px" gutterBottom>
                  {value ? dayjs(value).format('DD-MM-YYYY hh:mm') : '-'}
                </Typography>
              ),
            },
            {
              id: 'submissionType',
              label: 'Submission Type',
              align: 'left',
              filterType: 'string',
            },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              filterType: 'enum',
              isFilter: false,
              sticky: true,
              isSort: false,
              enumOptions: PublishUnpublishStatusOptions,
              render(value, row) {
                const color = PublishUnpublishStatusTypeColors[
                  value as PublishUnpublishStatusType
                ] as LabelColor;
                return <Label color={color}>{PublishUnpublishStatusType[value]}</Label>;
              },
            },
          ]}
          data={[
            {
              id: '1',
              title: 'Algebra Basics Assignment',
              assignmentType: 'Worksheet',
              startDate: '2025-05-20T08:00:00',
              endDate: '2025-05-22T17:00:00',
              submissionType: 'Online Upload',
              status: 1, // Published
            },
            {
              id: '2',
              title: 'Biology Lab Report',
              assignmentType: 'Lab Report',
              startDate: '2025-05-21T09:30:00',
              endDate: '2025-05-23T14:00:00',
              submissionType: 'In-Class Submission',
              status: 0, // Draft
            },
            {
              id: '3',
              title: 'History Timeline Creation',
              assignmentType: 'Project',
              startDate: '2025-05-22T10:00:00',
              endDate: '2025-05-25T16:00:00',
              submissionType: 'Online Upload',
              status: 1, // Published
            },
            {
              id: '4',
              title: 'English Poetry Analysis',
              assignmentType: 'Essay',
              startDate: '2025-05-23T07:45:00',
              endDate: '2025-05-26T13:30:00',
              submissionType: 'In-Class Presentation',
              status: 0, // Draft
            },
          ]}
        />
      </Card>
    </Grid>
  </Grid>
);

export default HomeworkAssignment;
