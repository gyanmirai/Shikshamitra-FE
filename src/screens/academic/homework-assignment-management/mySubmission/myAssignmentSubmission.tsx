import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Tab, Tabs, MenuItem, MenuList } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import mySubmissionData from 'src/json/academic/homeworkAssignment/myAssignmentData.json';
import {
  ScheduleExamStatus,
  ScheduleExamStatusColor,
  ScheduleExamStatusOptions,
} from 'src/enums/schedule-exam-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AssignGrade from '../assignmentCreation/studentSubmission/assignMarksForm';
import { SubmitAssignmentFile } from './assignmentSubmission/submitAssignmentFile';
import { SubmitAssignmentContent } from './assignmentSubmission/submitAssignmentContent';
import AssignMarksForText from '../assignmentCreation/studentSubmission/assignMarksForText';
import ViewAssignmentDetails from '../assignmentCreation/assignmentDetail/assignmentDetail';

import type { IAssignment } from '../assignmentCreation/type';

const MyAssignmentSubmission = (props: TabComponentType) => {
  // State to manage active tab using custom hook
  const tabs = useTabs(ScheduleExamStatus.Pending);

  // Dialog state for assignment submission
  const assignmentSubmissionDialog = useBoolean();

  // Dialog state for viewing submission
  const viewSubmissionDialog = useBoolean();
  // Dialog control state for viewing homework details
  const viewAssignmentDetails = useBoolean();

  // State to store currently selected assignment
  const [selectedAssignment, setSelectedAssignment] = useState<IAssignment | null>(null);

  // State to store and update the selected date using dayjs
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  // Memoized count of pending and completed assignments
  const examCounts = useMemo(
    () => ({
      pending:
        mySubmissionData?.filter((i) => i.submissionStatus === ScheduleExamStatus.Pending)
          ?.length || 0,
      completed:
        mySubmissionData?.filter((i) => i.submissionStatus === ScheduleExamStatus.Completed)
          ?.length || 0,
    }),
    []
  );

  // Memoized tab configuration based on exam counts
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

  // Callback for handling menu actions (upload/view submission)
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {tabs.value === 0 ? (
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
        ) : (
          <MenuItem
            onClick={() => {
              viewSubmissionDialog.onTrue();
              setSelectedAssignment(row);
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.eye} />
            View Submission
          </MenuItem>
        )}
      </MenuList>
    ),
    [assignmentSubmissionDialog, tabs.value, viewSubmissionDialog]
  );

  // Redux dispatch and state
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Handler for tab change events
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  // Memoized filtered table data based on active tab
  const tableData = useMemo(
    () => mySubmissionData?.filter((i: any) => i.submissionStatus === tabs.value),
    [tabs.value]
  );

  // Handler for closing dialogs with confirmation if there are unsaved changes
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      setSelectedAssignment(null);
      viewSubmissionDialog.onFalse();
      assignmentSubmissionDialog.onFalse();
    } else if (!isChanges) {
      setSelectedAssignment(null);
      viewSubmissionDialog.onFalse();
      assignmentSubmissionDialog.onFalse();
    }
  };

  return (
    <Box>
      <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
        <DatePicker
          label="Assignment Date"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          name="date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD-MM-YYYY"
          sx={{ maxWidth: '250px' }}
        />
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
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
          placeholder: 'Search by Subject, Title, Assignment Type...',
          label: 'Search by Subject, Title, Assignment Type...',
          sx: {
            maxWidth: '500px',
            width: '100%',
          },
        }}
        noDataText={<>No Assignment Available</>}
        columns={
          tabs.value === ScheduleExamStatus.Pending
            ? [
                {
                  id: 'subjects',
                  label: 'Subject',
                  align: 'left',
                  filterType: 'string',
                },
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
                  id: 'endDate',
                  label: 'End Date',
                  align: 'left',
                  filterType: 'date',
                },
                {
                  id: 'createdBy',
                  label: 'Created By',
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
                      showViewIcon
                      handleViewClick={() => {
                        setSelectedAssignment(row as IAssignment);
                        viewAssignmentDetails.onTrue();
                      }}
                      actions={(prop) => actions({ ...prop, row })}
                    />
                  ),
                },
              ]
            : [
                {
                  id: 'subjects',
                  label: 'Subject',
                  align: 'left',
                  filterType: 'string',
                },
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
                  id: 'endDate',
                  label: 'End Date',
                  align: 'left',
                  filterType: 'date',
                },
                {
                  id: 'createdBy',
                  label: 'Created By',
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
                  id: 'marks',
                  label: 'Marks',
                  align: 'left',
                  filterType: 'number',
                },
                {
                  id: 'feedback',
                  label: 'Feedback',
                  align: 'left',
                  filterType: 'string',
                },
                {
                  id: 'marksStatus',
                  label: 'Marks Status',
                  sticky: true,
                  filterType: 'enum',
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
                      showViewIcon
                      handleViewClick={() => {
                        setSelectedAssignment(row as IAssignment);
                        viewAssignmentDetails.onTrue();
                      }}
                    />
                  ),
                },
              ]
        }
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

      <CustomDialog
        open={viewSubmissionDialog.value}
        handleClose={() => {
          viewSubmissionDialog.onFalse();
          setSelectedAssignment(null);
        }}
        title="View Submission"
        maxWidth="sm"
      >
        {selectedAssignment?.submissionType === 'file_upload' ? (
          <AssignGrade isEdit={false} data={null} onClose={handleClose} />
        ) : (
          <AssignMarksForText isEdit={false} data={null} onClose={handleClose} />
        )}
      </CustomDialog>

      <CustomDialog
        title={selectedAssignment?.title || 'Homework Details'}
        open={viewAssignmentDetails.value}
        handleClose={() => {
          viewAssignmentDetails.onFalse();
          setSelectedAssignment(null);
        }}
        maxWidth="md"
      >
        <ViewAssignmentDetails assignment={selectedAssignment} />
      </CustomDialog>
    </Box>
  );
};

export default MyAssignmentSubmission;
