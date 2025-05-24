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
import assignmentTableData from 'src/json/academic/homeworkAssignment/assignment-table-data.json';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { SubmitAssignmentFile } from './assignmentSubmission/submitAssignmentFile';
import { SubmitAssignmentContent } from './assignmentSubmission/submitAssignmentContent';

import type { IAssignment } from '../assignmentCreation/type';

const MyAssignmentSubmission = (props: TabComponentType) => {
  const tabs = useTabs(ScheduleExamStatus.Pending);
  const assignmentSubmissionDialog = useBoolean();
  const [selectedAssignment, setSelectedAssignment] = useState<IAssignment | null>(null);

  const assignmentCounts = useMemo(
    () => ({
      pending:
        assignmentTableData?.filter((i) => i.status === ScheduleExamStatus.Pending)?.length || 0,
      completed:
        assignmentTableData?.filter((i) => i.status === ScheduleExamStatus.Completed)?.length || 0,
    }),
    []
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: ScheduleExamStatus.Pending,
        count: assignmentCounts.pending,
        color: 'warning',
      },
      {
        label: 'Completed',
        value: ScheduleExamStatus.Completed,
        count: assignmentCounts.completed,
        color: 'success',
      },
    ],
    [assignmentCounts]
  );

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            assignmentSubmissionDialog.onTrue();
            setSelectedAssignment(row);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.upload} />
          Upload
        </MenuItem>
      </MenuList>
    ),
    [assignmentSubmissionDialog]
  );

  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  const tableData = useMemo(
    () => assignmentTableData?.filter((i: any) => i.status === tabs.value),
    [tabs.value]
  );

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      setSelectedAssignment(null);
      assignmentSubmissionDialog.onFalse();
    } else if (!isChanges) {
      setSelectedAssignment(null);
      assignmentSubmissionDialog.onFalse();
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
                  <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>
      <CustomizableTable
        tableId="assignment-submission-management"
        searchFieldProps={{
          placeholder: 'Search by Assignment Title, Type, Creation Date...',
          label: 'Search by Assignment Title, Type, Creation Date...',
          sx: {
            maxWidth: '500px',
            width: '100%',
          },
        }}
        noDataText={<>No Assignment Available</>}
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
        title={selectedAssignment?.title || 'Assignment Details'}
        open={assignmentSubmissionDialog.value}
        handleClose={() => {
          assignmentSubmissionDialog.onFalse();
          setSelectedAssignment(null);
        }}
        maxWidth={selectedAssignment?.submissionType === 'file_upload' ? 'sm' : 'md'}
      >
        {selectedAssignment?.submissionType === 'file_upload' ? (
          <SubmitAssignmentFile selectedAssignment={selectedAssignment} onClose={handleClose} />
        ) : (
          <SubmitAssignmentContent selectedAssignment={selectedAssignment} onClose={handleClose} />
        )}
      </CustomDialog>
    </Box>
  );
};

export default MyAssignmentSubmission;
