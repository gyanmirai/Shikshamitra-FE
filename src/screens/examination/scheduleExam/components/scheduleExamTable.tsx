import type { LabelColor } from 'src/components/label';

import React, { useMemo } from 'react';

import { Box, Tab, Chip, Tabs } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { ScheduleExamStatus } from 'src/enums/schedule-exam-status';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { ISubjectDetail, IExamFormValues, IScheduledExamTableProps } from '../type';

const ScheduledExamTable: React.FC<IScheduledExamTableProps> = ({
  openDialog,
  setOpenDialog,
  editData,
  setEditData,
  onDelete,
  data,
  onViewTimetable,
}) => {
  // Initialize tabs with default value of 'Pending'
  const tabs = useTabs(ScheduleExamStatus.Pending);

  // Calculate counts of exams by status
  const examCounts = useMemo(
    () => ({
      pending: data?.filter((i) => i.status === ScheduleExamStatus.Pending)?.length || 0,
      completed: data?.filter((i) => i.status === ScheduleExamStatus.Completed)?.length || 0,
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
    <Box>
      <Box display="flex" gap={1} alignItems="flex-start">
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            mb: 2,
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label
                    // variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                    color={(tab?.color as LabelColor) || 'default'}
                  >
                    {tab.count}
                  </Label>
                </Box>
              }
              // icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>
      <CustomizableTable
        tableId="schedule-exam-table"
        searchFieldProps={{
          placeholder: 'Search by Class, Subject Name...',
          label: 'Search by Class, Subject Name...',
        }}
        noDataText={
          <>
            No Exam Data Found{' '}
            <Box
              onClick={() => {
                setOpenDialog(true);
                setEditData(null);
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
              Create Exam
            </Box>
          </>
        }
        columns={[
          { id: 'className', label: 'Class', align: 'left', minWidth: 250 },
          {
            id: 'divisions',
            label: 'Division',
            align: 'left',
            minWidth: 250,
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((division: string) => (
                  <Chip key={division} label={division} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          { id: 'examType', label: 'Exam Type', align: 'left', minWidth: 250 },
          {
            id: 'subjects',
            label: 'Subjects',
            align: 'left',
            minWidth: 250,
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((subject: ISubjectDetail) => (
                  <Chip
                    key={subject.id}
                    label={subject.subjectName}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 100,
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  placement="right-top"
                  showViewIcon
                  showDeleteIcon
                  showEditIcon
                  handleDeleteClick={() => {
                    onDelete(row as IExamFormValues);
                  }}
                  handleEditClick={() => {
                    setOpenDialog(true);
                  }}
                  handleViewClick={() => {
                    onViewTimetable(row as IExamFormValues);
                  }}
                />
              );
            },
          },
        ]}
        data={tableData}
      />
    </Box>
  );
};

export default ScheduledExamTable;
