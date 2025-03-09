import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Tab, Tabs, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { initialData } from 'src/screens/academic/homework-assignment-management/homeworkCreation/homework-creation';

import { Label } from '../label';
import { Iconify } from '../iconify';
import ThreeDotsActions from '../three-dots-actions';
import CustomizableTable from '../customizabaleTable';

import type { LabelColor } from '../label';
import type { Column } from '../customizabaleTable';

const TABS = [
  {
    value: 'completed',
    label: 'Completed',
    icon: <Iconify icon="stash:feed-duotone" width={20} />,
    color: 'success',
    count: 100,
    //   component: () => <FinanceFeeStructureOverview />,
  },
  {
    value: 'pending',
    label: 'Pending',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    color: 'warning',
    count: 20,
    //   component: () => <FinanceStudentStructureOverview />,
  },
];

const HomeworkAssignment = () => {
  const [tabValue, setTabValue] = useState('completed');
  const [view, setView] = useState('homework');
  const [assignmentData, setAssignmentData] = useState<any[]>(initialData);

  const handleChangeView = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    if (nextView) {
      setView(nextView);
    }
  };

  const homeworkColumns: Column[] = [
    {
      id: 'title',
      label: 'Homework Title',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'homeworkType',
      label: 'Homework Type',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'todaysDate',
      label: 'Creation Date',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'dueTime',
      label: 'Due Time',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('HH:MM') : '-'}
        </Typography>
      ),
    },
    {
      id: 'submissionType',
      label: 'Submission Type',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'action',
      label: 'Actions',
      isSort: false,
      isFilter: false,
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <ThreeDotsActions
          placement="right-top"
          showViewIcon
          showEditIcon
          showThreeDots={false}
          handleEditClick={() => {}}
          handleViewClick={() => {
            // submissionDialog.onTrue();
          }}
        />
      ),
    },
  ];

  // Columns for Assignment view
  const assignmentColumns: Column[] = [
    {
      id: 'title',
      label: 'Assignment Title',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'assignmentType',
      label: 'Assignment Type',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'todaysDate',
      label: 'Creation Date',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'dueTime',
      label: 'Due Time',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('HH:MM') : '-'}
        </Typography>
      ),
    },
    {
      id: 'submissionType',
      label: 'Submission Type',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'rubric',
      label: 'View Rubric',
      minWidth: '200px',
      align: 'left',
      render: (value, row) => <Iconify icon="mdi:eye" width="16px" height="16px" />,
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: '200px',
      align: 'left',
      isSort: false,
      isFilter: false,
      render: (value: any, row: any) => (
        <ThreeDotsActions
          placement="right-top"
          showViewIcon
          showEditIcon
          showThreeDots={false}
          handleEditClick={() => {}}
          handleViewClick={() => {
            // submissionDialog.onTrue();
          }}
        />
      ),
    },
  ];

  const filteredData =
    view === 'homework'
      ? assignmentData.filter((assignment) => assignment.homeworkType)
      : assignmentData.filter((assignment) => assignment.assignmentType);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
          <ToggleButton value="homework">
            <Iconify icon="mdi:book-open-page-variant" mr={1} />
            <Typography variant="subtitle2">Homework</Typography>
          </ToggleButton>
          <ToggleButton value="assignment">
            <Iconify icon="mdi:assignment" mr={1} />
            <Typography variant="subtitle2">Assignment</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Tabs
        value={tabValue}
        onChange={(e, value) => setTabValue(value)}
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
                  variant="soft"
                  //   variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                  color={(tab?.color as LabelColor) || 'default'}
                >
                  {' '}
                  {tab.count}
                </Label>
              </Box>
            }
            // icon={tab.icon}
            value={tab.value}
          />
        ))}
      </Tabs>
      <CustomizableTable
        tableId="homework-assignment-management"
        columns={view === 'homework' ? homeworkColumns : assignmentColumns}
        data={filteredData}
      />
    </Box>
  );
};

export default HomeworkAssignment;
