'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, MenuList, MenuItem, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
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
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import AssignGrade from './assignMarksForm';
import AssignMarksForText from './assignMarksForText';

import type { IStudentSubmissionsProps } from '../type';
import type { TStudentGrade } from '../../homeworkCreation/type';

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedStudents,
  selectedAssignment,
  handleBulkUpdate,
  tableData,
  setTableData,
}) => {
  // State to track the currently selected student for individual grading
  const [selectedStudent, setSelectedStudent] = useState<TStudentGrade | null>();

  // Dialog control for sending instant notifications
  const sendInstantNotificationDialogValue = useBoolean();
  // Dialog control for single student grade assignment
  const dialog = useBoolean();
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch
  const dispatch = useDispatch();
  // Dialog control for viewing student submission details
  const viewSubmissionDialog = useBoolean();

  /**
   * Handles closing the view submission dialog and resetting the selected student
   */
  const handleCloseDialog = () => {
    setSelectedStudent(null);
    viewSubmissionDialog.onFalse();
  };

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      setSelectedStudent(null);
      viewSubmissionDialog.onFalse();
    } else if (!isChanges) {
      setSelectedStudent(null);
      viewSubmissionDialog.onFalse();
    }
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.marksStatus === 0 && row.submissionStatus !== 0 && (
            <MenuItem
              onClick={() => {
                setSelectedStudent(row);
                viewSubmissionDialog.onTrue();
                pop.onClose();
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow-right-bold" sx={{ height: '16px', width: '16px' }} />
              Assign Marks
            </MenuItem>
          )}
          {row.marksStatus === 1 && row.submissionStatus === 1 && (
            <MenuItem
              onClick={() => {
                setSelectedStudent(row);
                viewSubmissionDialog.onTrue();
                pop.onClose();
              }}
            >
              {' '}
              <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
              Edit Marks
            </MenuItem>
          )}
          {row.submissionStatus === 0 && (
            <MenuItem onClick={() => {}}>
              {' '}
              <Iconify icon="mdi:bell" sx={{ height: '16px', width: '16px' }} />
              Send Reminder
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [viewSubmissionDialog]
  );

  /**
   * Handler for sending notifications
   * Opens the instant notification dialog if it's not already open
   */
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents?.length !== 0}
        tableId="student-submissions"
        searchFieldProps={{
          placeholder: 'Search by Gr No, Student Name, Assignment...',
          label: 'Search by Gr No, Student Name, Assignment...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText="No Submission Data Found"
        columns={[
          { id: 'studentName', label: 'Student Name', align: 'left', sticky: true, minWidth: 170 },
          { id: 'grNo', label: 'Gr No' },
          { id: 'assignment', label: 'Title' },
          { id: 'assignmentType', label: 'Type' },
          {
            id: 'submissionType',
            label: 'Submission Type',
            align: 'left',
          },
          {
            id: 'submissionDate',
            label: 'Submission Date',
            align: 'left',
          },
          {
            id: 'marks',
            label: 'Marks',
            render: (value, row) =>
              value === '' ? (
                <Typography variant="subtitle2" color="textSecondary">
                  -
                </Typography>
              ) : (
                <Typography variant="caption" gutterBottom>
                  {value}
                </Typography>
              ),
          },
          {
            id: 'totalMarks',
            label: 'Total Marks',
          },
          {
            id: 'feedback',
            label: 'Feedback',
            render: (value, row) =>
              value === '' ? (
                <Typography variant="subtitle2" color="textSecondary">
                  -
                </Typography>
              ) : (
                <Typography variant="caption" gutterBottom>
                  {value}
                </Typography>
              ),
          },
          {
            id: 'marksStatus',
            label: 'Marks Status',
            filterType: 'enum',
            sticky: true,
            enumOptions: ScheduleExamStatusOptions,
            align: 'left',
            render(value, row) {
              const color = ScheduleExamStatusColor[value as ScheduleExamStatus] as LabelColor;
              return <Label color={color}>{ScheduleExamStatus[value]}</Label>;
            },
          },
          {
            id: 'submissionStatus',
            label: 'Submission Status',
            filterType: 'enum',
            sticky: true,
            enumOptions: ScheduleExamStatusOptions,
            align: 'left',
            render(value, row) {
              const color = ScheduleExamStatusColor[value as ScheduleExamStatus] as LabelColor;
              return <Label color={color}>{ScheduleExamStatus[value]}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            align: 'center',
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            id: '1',
            grNo: 'GR001',
            studentName: 'Mehta Aarav Kumar',
            assignment: 'Math Assignment 1',
            assignmentType: 'Practice',
            submissionType: 'online',
            submissionDate: '20-05-2025',
            marks: 18,
            totalMarks: 20,
            feedback: 'Well done!',
            marksStatus: 1,
            submissionStatus: 1,
          },
          {
            id: '2',
            grNo: 'GR002',
            studentName: 'Patel Nisha Rajesh',
            assignment: 'Science Homework',
            assignmentType: 'Graded',
            submissionType: 'file_upload',
            submissionDate: '19-05-2025',
            marks: 30,
            totalMarks: 35,
            feedback: '',
            marksStatus: 0,
            submissionStatus: 1,
          },
          {
            id: '3',
            grNo: 'GR003',
            studentName: 'Shah Ravi Mukesh',
            assignment: 'English Essay',
            assignmentType: 'Practice',
            submissionType: 'online',
            submissionDate: '18-05-2025',
            marks: 15,
            totalMarks: 25,
            feedback: 'Good effort.',
            marksStatus: 1,
            submissionStatus: 1,
          },
          {
            id: '4',
            grNo: 'GR004',
            studentName: 'Desai Sneha Prakash',
            assignment: 'History Worksheet',
            assignmentType: 'Graded',
            submissionType: 'file_upload',
            submissionDate: '',
            marks: 0,
            totalMarks: 30,
            feedback: '',
            marksStatus: 0,
            submissionStatus: 0,
          },
        ]}
      />

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
      <CustomDialog
        open={viewSubmissionDialog.value}
        handleClose={handleCloseDialog}
        title={selectedStudent ? 'Edit Marks' : 'Add Marks'}
        maxWidth="sm"
      >
        {selectedAssignment?.submissionType === 1 ? (
          <AssignGrade data={selectedStudent} onClose={handleClose} isEdit />
        ) : (
          <AssignMarksForText data={selectedStudent} onClose={handleClose} isEdit />
        )}
      </CustomDialog>
    </Box>
  );
};
