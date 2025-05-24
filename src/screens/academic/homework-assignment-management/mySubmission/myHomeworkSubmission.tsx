import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useCallback } from 'react';

import { Box, Tab, Tabs, MenuItem, MenuList, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { ScheduleExamStatus } from 'src/enums/schedule-exam-status';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import homeworkTableData from 'src/json/academic/homeworkAssignment/homework-table-data.json';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { SubmitHomeworkFile } from './homeworkSubmission/submitHomeworkFile';
import { SubmitHomeworkContent } from './homeworkSubmission/submitHomeworkContent';

import type { IHomework } from '../homeworkCreation/type';

const MyHomeworkSubmission = (props: TabComponentType) => {
  // Initialize tabs with default value of 'Pending'
  const tabs = useTabs(ScheduleExamStatus.Pending);
  const homeworkSubmissionDialog = useBoolean();
  const [selectedHomework, setSelectedHomework] = useState<IHomework | null>(null);
  // Calculate counts of exams by status
  const examCounts = useMemo(
    () => ({
      pending:
        homeworkTableData?.filter((i) => i.status === ScheduleExamStatus.Pending)?.length || 0,
      completed:
        homeworkTableData?.filter((i) => i.status === ScheduleExamStatus.Completed)?.length || 0,
    }),
    []
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

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            homeworkSubmissionDialog.onTrue();
            setSelectedHomework(row);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.upload} />
          Upload
        </MenuItem>
      </MenuList>
    ),
    [homeworkSubmissionDialog]
  );

  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Handle tab change event
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  // Filter table data based on selected tab value
  const tableData = useMemo(
    () => homeworkTableData?.filter((i: any) => i.status === tabs.value),
    [tabs.value]
  );

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      setSelectedHomework(null);
      homeworkSubmissionDialog.onFalse();
    } else if (!isChanges) {
      setSelectedHomework(null);
      homeworkSubmissionDialog.onFalse();
    }
  };

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
        tableId="homework-assignment-management"
        searchFieldProps={{
          placeholder: 'Search by Homework Title, Type , Creation Date...',
          label: 'Search by Homework Title, Type, Creation Date...',
          sx: {
            maxWidth: '500px',
            width: '100%',
          },
        }}
        noDataText={<>No Homework Available</>}
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
            id: 'submissionType',
            label: 'Submission Type',
            align: 'left',
            filterType: 'string',
          },
          {
            id: 'dueDate',
            label: 'Due Date Time',
            align: 'left',
            filterType: 'date',
            render: (value) => (
              <Typography fontSize="12px" gutterBottom>
                {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
              </Typography>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            sticky: true,
            align: 'center',
            minWidth: 50,
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={(prop) => actions({ ...prop, row })}
              />
            ),
          },
        ]}
        data={tableData}
      />
      <CustomDialog
        title={selectedHomework?.title || 'Homework Details'}
        open={homeworkSubmissionDialog.value}
        handleClose={() => {
          homeworkSubmissionDialog.onFalse();
          setSelectedHomework(null);
        }}
        maxWidth={selectedHomework?.submissionType === 'file_upload' ? 'sm' : 'md'}
      >
        {selectedHomework?.submissionType === 'file_upload' ? (
          <SubmitHomeworkFile selectedHomework={selectedHomework} onClose={handleClose} />
        ) : (
          <SubmitHomeworkContent selectedHomework={selectedHomework} onClose={handleClose} />
        )}
      </CustomDialog>
    </Box>
  );
};

export default MyHomeworkSubmission;
