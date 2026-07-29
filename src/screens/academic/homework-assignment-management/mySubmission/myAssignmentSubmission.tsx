import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import { AssignmentSubmissionType } from 'src/enums/assignment';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import mySubmissionData from 'src/json/academic/homeworkAssignment/myAssignmentData.json';
import {
  ScheduleExamStatus,
  ScheduleExamStatusColor,
  ScheduleExamStatusOptions,
} from 'src/enums/schedule-exam-status';

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
        mySubmissionData?.filter((i) => i.submissionStatus === ScheduleExamStatus.Submitted)
          ?.length || 0,
    }),
    []
  );

  // Memoized tab configuration based on exam counts
  useMemo(
    () => [
      {
        label: 'Pending',
        value: ScheduleExamStatus.Pending,
        count: examCounts.pending,
        color: 'warning',
      },
      {
        label: 'Completed',
        value: ScheduleExamStatus.Submitted,
        count: examCounts.completed,
        color: 'success',
      },
    ],
    [examCounts]
  );

  // Callback for handling menu actions (upload/view submission)
  useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {tabs.value === 0 &&
        row.submissionType !== AssignmentSubmissionType.NoSubmissionRequired ? (
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
        ) : tabs.value !== 0 ? (
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
        ) : null}
      </MenuList>
    ),
    [assignmentSubmissionDialog, tabs.value, viewSubmissionDialog]
  );

  // Redux dispatch and state
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

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
      </Box>
      <CustomizableTable
        tableId="assignment-submission-management"
        noDataText={<>No Assignment Available</>}
        columns={[
          {
            id: 'subjects',
            label: 'Subject',
            align: 'left',
            filterType: 'string',
          },
          {
            id: 'title',
            label: 'Title',
            align: 'left',
            filterType: 'string',
          },
          {
            id: 'assignmentType',
            label: 'Type',
            align: 'left',
            filterType: 'string',
          },
          {
            id: 'startDate',
            label: 'Created At',
            align: 'left',
            filterType: 'date',
            minWidth: 110,
          },
          {
            id: 'endDate',
            label: 'End Date',
            align: 'left',
            filterType: 'date',
            minWidth: 100,
          },
          {
            id: 'createdBy',
            label: 'Created By',
            align: 'left',
            filterType: 'string',
            minWidth: 120,
          },
          {
            id: 'submissionType',
            label: 'Submission Type',
            align: 'left',
            filterType: 'string',
            minWidth: 160,
          },
          {
            id: 'marks',
            label: 'Marks',
            align: 'left',
            filterType: 'number',
            minWidth: 120,
            render: (value, row) =>
              value ? (
                <Typography variant="caption" fontWeight="13px">
                  {value}
                </Typography>
              ) : (
                <Typography variant="caption" fontWeight="13px">
                  -
                </Typography>
              ),
          },
          {
            id: 'feedback',
            label: 'Feedback',
            render: (value, row) => (
              <CustomTooltip title={value || '-'} arrow>
                <Typography
                  variant="caption"
                  fontSize="13px"
                  noWrap
                  sx={{
                    maxWidth: 150,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {value || '-'}
                </Typography>
              </CustomTooltip>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: 80,
            sticky: true,
            filterType: 'enum',
            enumOptions: ScheduleExamStatusOptions,
            align: 'left',
            render(value, row) {
              const color = ScheduleExamStatusColor[value as ScheduleExamStatus] as LabelColor;
              return <Label color={color}>{ScheduleExamStatus[value]}</Label>;
            },
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
        maxWidth={selectedAssignment?.submissionType === 1 ? 'sm' : 'md'}
      >
        {selectedAssignment?.submissionType === 1 ? (
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
        {selectedAssignment?.submissionType === 1 ? (
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
