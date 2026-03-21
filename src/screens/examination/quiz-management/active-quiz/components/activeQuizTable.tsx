import type { LabelColor } from 'src/components/label';
import type { IQuizData } from 'src/screens/examination/quiz/type';

import React, { useMemo } from 'react';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/useTabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Tab, Tabs, Card, Button, MenuList, MenuItem, Typography } from '@mui/material';
import {
  ScheduleExamStatus,
  ScheduleExamStatusColor,
  ScheduleExamStatusOptions,
} from 'src/enums/schedule-exam-status';

import { StudentSubmissions } from './studentSubmission';

const QuizTable = ({
  data,
  addQuizDialog,
  onAttemptClick,
  onDelete,
  onEdit,
  setOpenDialog,
}: any) => {
  // Initialize tabs state with default value of Pending status
  const tabs = useTabs(ScheduleExamStatus.Pending);

  // Boolean state to control view submission dialog visibility
  const viewSubmissionDialog = useBoolean();

  // Boolean state to control view analytics dialog visibility
  const actions = ({ row, popover }: any) => (
    <Box>
      <MenuList>
        {tabs.value === ScheduleExamStatus.Pending && (
          <>
            <MenuItem onClick={() => onAttemptClick(row)}>
              <Iconify icon="fluent:quiz-new-20-filled" sx={{ height: '16px', width: '16px' }} />
              Attempt Quiz
            </MenuItem>

            <MenuItem onClick={() => {}}>
              <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
              View Questions
            </MenuItem>
          </>
        )}

        {tabs.value === ScheduleExamStatus.Completed && (
          <>
            <MenuItem onClick={() => {}}>
              <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
              View Questions
            </MenuItem>

            <MenuItem
              onClick={() => {
                viewSubmissionDialog.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
              View Submission
            </MenuItem>
          </>
        )}
      </MenuList>
    </Box>
  );

  // Calculate counts of exams by status
  const examCounts = useMemo(
    () => ({
      pending: data?.filter((i: IQuizData) => i.status === ScheduleExamStatus.Pending)?.length || 0,
      completed:
        data?.filter((i: IQuizData) => i.status === ScheduleExamStatus.Completed)?.length || 0,
    }),
    [data]
  );

  // Define tab configuration with labels, values, counts and colors
  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: ScheduleExamStatus.Pending,
        count: examCounts.pending,
        color: 'warning',
      },
      {
        label: 'Completed',
        value: ScheduleExamStatus.Completed,
        count: examCounts.completed,
        color: 'success',
      },
    ],
    [examCounts]
  );

  // Handle tab change event
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  // Filter table data based on selected tab value
  const tableData = useMemo(
    () => data?.filter((i: any) => i.status === tabs.value),
    [data, tabs.value]
  );

  return (
    <>
      {/* Tabs Section */}
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 2, pb: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <Tabs
            value={tabs.value}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-flexContainer': { gap: 2 },
              flexGrow: 1,
              pb: 1,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                sx={{ fontSize: '12px' }}
                key={tab.value}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label}{' '}
                    <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                  </Box>
                }
                value={tab.value}
              />
            ))}
          </Tabs>
          <Button
            size="small"
            startIcon={<Add />}
            variant="contained"
            onClick={() => {
              setOpenDialog(true);
            }}
            sx={{ px: '32px', mt: 1.5 }}
          >
            Quiz
          </Button>
        </Box>
      </Card>

      <CustomizableTable
        tableId="quiz-table"
        noDataText={
          <>
            Quiz Data Not Found{' '}
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
              Create Quiz
            </Box>
          </>
        }
        columns={
          tabs.value === ScheduleExamStatus.Pending
            ? [
                { id: 'class', label: 'Class', align: 'left', filterType: 'string' },
                {
                  id: 'division',
                  label: 'Divisions',
                  align: 'left',
                  filterType: 'string',
                  render: (value) => <Box>{value.join(', ')}</Box>,
                },
                {
                  id: 'quizTitle',
                  label: 'Title',
                  align: 'left',
                  filterType: 'string',
                },
                {
                  id: 'subject',
                  label: 'Subject',
                  align: 'left',
                  minWidth: 160,
                  filterType: 'string',
                  render(value, row) {
                    return (
                      <Box key={value.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 18,
                            borderRadius: 1,
                            backgroundColor: row.subjectColor,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontSize: '13px' }}>
                          {value} ({row.subjectCode})
                        </Typography>
                      </Box>
                    );
                  },
                },
                {
                  id: 'createdAt',
                  label: 'Created At',
                  align: 'left',
                  filterType: 'date',
                  minWidth: 90,
                },
                {
                  id: 'quizDate',
                  label: 'Start Date',
                  align: 'left',
                  filterType: 'date',
                  minWidth: 60,
                },
                {
                  id: 'quizEndDate',
                  label: 'End Date',
                  align: 'left',
                  filterType: 'date',
                  minWidth: 110,
                },
                {
                  id: 'quizTime',
                  label: 'Start Time',
                  align: 'left',
                  filterType: 'date',
                  minWidth: 110,
                },
                {
                  id: 'quizEndTime',
                  label: 'End Time',
                  align: 'left',
                  filterType: 'date',
                  minWidth: 110,
                },
                {
                  id: 'quizDuration',
                  label: 'Duration',
                  align: 'left',
                  filterType: 'string',
                },
                {
                  id: 'totalMarks',
                  label: 'Total Marks',
                  align: 'left',
                  filterType: 'number',
                  minWidth: 120,
                },
                {
                  id: 'passingMarks',
                  label: 'Passing Marks',
                  align: 'left',
                  filterType: 'number',
                  minWidth: 100,
                },
                {
                  id: 'action',
                  label: 'Actions',
                  isSort: false,
                  sticky: true,
                  isFilter: false,
                  align: 'left',
                  minWidth: 70,
                  render(value, row) {
                    return (
                      <ThreeDotsActions
                        actions={(props) => actions({ ...props, row })}
                        placement="right-top"
                        showEditIcon
                        showDeleteIcon
                        handleEditClick={() => {
                          onEdit(row as IQuizData);
                        }}
                        handleDeleteClick={() => {
                          onDelete(row as IQuizData);
                        }}
                      />
                    );
                  },
                },
              ]
            : [
                { id: 'class', label: 'Class', align: 'left', filterType: 'string' },
                {
                  id: 'division',
                  label: 'Divisions',
                  align: 'left',
                  filterType: 'string',
                  render: (value) => <Box>{value.join(', ')}</Box>,
                },
                {
                  id: 'quizTitle',
                  label: 'Title',
                  align: 'left',
                  minWidth: 160,
                  filterType: 'string',
                },
                {
                  id: 'subject',
                  label: 'Subject',
                  align: 'left',
                  filterType: 'string',
                  render(value, row) {
                    return (
                      <Box key={value.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 18,
                            borderRadius: 1,
                            backgroundColor: row.subjectColor,
                          }}
                        />
                        <Typography variant="caption">
                          {value} ({row.subjectCode})
                        </Typography>
                      </Box>
                    );
                  },
                },
                {
                  id: 'createdAt',
                  label: 'Created At',
                  align: 'left',
                  minWidth: 120,
                  filterType: 'date',
                },
                {
                  id: 'quizDate',
                  label: 'Date',
                  align: 'left',
                  filterType: 'date',
                },
                {
                  id: 'quizTime',
                  label: 'Time',
                  align: 'left',
                  filterType: 'date',
                },
                {
                  id: 'quizEndDate',
                  label: 'End Date',
                  align: 'left',
                  minWidth: 100,
                  filterType: 'date',
                },
                {
                  id: 'quizEndTime',
                  label: 'End Time',
                  align: 'left',
                  minWidth: 100,
                  filterType: 'date',
                },
                {
                  id: 'quizDuration',
                  label: 'Duration',
                  align: 'left',
                  filterType: 'string',
                },
                {
                  id: 'totalMarks',
                  label: 'Total Marks',
                  align: 'left',
                  minWidth: 120,
                  filterType: 'number',
                },
                {
                  id: 'passingMarks',
                  label: 'Passing Marks',
                  align: 'left',
                  minWidth: 140,
                  filterType: 'number',
                },
                {
                  id: 'marksStatus',
                  label: 'Marks Status',
                  filterType: 'enum',
                  minWidth: 130,
                  sticky: true,
                  enumOptions: ScheduleExamStatusOptions,
                  align: 'left',
                  render(value, row) {
                    const color = ScheduleExamStatusColor[
                      value as ScheduleExamStatus
                    ] as LabelColor;
                    return <Label color={color}>{ScheduleExamStatus[value]}</Label>;
                  },
                },
                {
                  id: 'actions',
                  label: 'Actions',
                  isSort: false,
                  sticky: true,
                  isFilter: false,
                  align: 'left',
                  minWidth: 70,
                  render(value, row) {
                    return (
                      <ThreeDotsActions
                        actions={(props) => actions({ ...props, row })}
                        placement="right-top"
                      />
                    );
                  },
                },
              ]
        }
        data={tableData}
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Quiz Submission</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View detailed submission information including student answers, marks obtained, and submission status"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={viewSubmissionDialog.value}
        handleClose={viewSubmissionDialog.onFalse}
        maxWidth="lg"
      >
        <StudentSubmissions />
      </CustomDialog>
    </>
  );
};

export default QuizTable;
