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
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import AssignGrade from '../component/assignGradeForm';
import AssignMarksForText from '../component/assignMarksForText';

import type { TStudentGrade, IStudentSubmissionsProps } from '../type';

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedStudents,
  selectedHomework,
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
    const resetAfterClose = () => {
      setTimeout(() => {
        setSelectedStudent(null);
        dispatch(setIsChanges(false));
      }, 300); // Delay matches dialog exit animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      viewSubmissionDialog.onFalse();
      resetAfterClose();
    } else if (!isChanges) {
      viewSubmissionDialog.onFalse();
      resetAfterClose();
    }
  };

  // Memoized callback that returns the action menu items for each row
  // @param pop - Popover control object for menu visibility
  // @param row - Current row data containing submission and marks status
  // @returns JSX element containing conditional menu items
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {/* Show 'Assign Grade' option only when marks are not assigned (marksStatus=0)
              but submission is completed (submissionStatus!=0) */}
          {row.status === ScheduleExamStatus['Needs Review'] && (
            <MenuItem
              onClick={() => {
                setSelectedStudent(row);
                viewSubmissionDialog.onTrue();
                pop.onClose();
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow-right-circle" />
              Give Feedback
            </MenuItem>
          )}
          {row.status === ScheduleExamStatus.Reviewed && (
            <MenuItem
              onClick={() => {
                setSelectedStudent(row);
                viewSubmissionDialog.onTrue();
                pop.onClose();
              }}
            >
              {' '}
              <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
              Edit Feedback
            </MenuItem>
          )}

          {/* Show 'Send Reminder' option only when homework is published */}
          {row.status === ScheduleExamStatus.Published && (
            <MenuItem onClick={() => {}}>
              {' '}
              <Iconify icon="mdi:bell" sx={{ height: '16px', width: '16px' }} />
              Send Reminder
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [viewSubmissionDialog] // Re-create callback only when viewSubmissionDialog changes
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
        noDataText="No Submission Data Found"
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            align: 'left',
            sticky: true,
            minWidth: 170,
          },
          { id: 'rollNumber', label: 'Roll No.', align: 'left', minWidth: 90 },
          { id: 'homeworkType', label: 'Type', align: 'left' },
          {
            id: 'submissionDate',
            label: 'Submission Date',
            align: 'left',
            filterType: 'date',
            minWidth: 160,
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            filterType: 'date',
            minWidth: 140,
          },
          {
            id: 'feedback',
            label: 'Feedback',
            render: (value, row) => (
              <CustomTooltip title={value || '-'} arrow sx={{ textAlign: 'justify' }}>
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
          {
            id: 'actions',
            label: 'Action',
            minWidth: 50,
            isSort: false,
            isFilter: false,
            align: 'left',
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
            rollNumber: '1',
            studentName: 'Sharma Priya Rajesh',
            homework: selectedHomework?.value || '',
            homeworkType: 'Written Assignment',
            submissionType: selectedHomework?.submissionType || 'online_text',
            submissionDate: '20-05-2025',
            dueDate: '25-05-2025',
            marks: 45,
            totalMarks: 50,
            feedback: 'Excellent analysis!',
            status: ScheduleExamStatus.Reviewed,
          },
          {
            id: '2',
            rollNumber: '2',
            studentName: 'Kumar Arjun Dinesh',
            homework: selectedHomework?.value || '',
            homeworkType: 'Written Assignment',
            submissionType: selectedHomework?.submissionType || 'online_text',
            submissionDate: '21-05-2025',
            dueDate: '25-05-2025',
            marks: 28,
            totalMarks: 30,
            feedback: 'Great understanding of concepts',
            status: ScheduleExamStatus.Reviewed,
          },
          {
            id: '3',
            rollNumber: '3',
            studentName: 'Gupta Ananya Suresh',
            homework: selectedHomework?.value || '',
            homeworkType: 'Written Assignment',
            submissionType: selectedHomework?.submissionType || 'online_text',
            submissionDate: '23-05-2025',
            dueDate: '25-05-2025',
            marks: 0,
            totalMarks: 40,
            feedback: '',
            status: ScheduleExamStatus['Needs Review'],
          },
          {
            id: '4',
            rollNumber: '4',
            studentName: 'Singh Rohan Vikram',
            homework: selectedHomework?.value || '',
            homeworkType: 'Written Assignment',
            submissionType: selectedHomework?.submissionType || 'online_text',
            submissionDate: '24-05-2025',
            dueDate: '25-05-2025',
            marks: 24,
            totalMarks: 25,
            feedback: 'Excellent analysis!',
            status: ScheduleExamStatus.Reviewed,
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedStudent?.feedback ? 'Edit Feedback' : 'Add Feedback'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedStudent?.feedback
                  ? 'You can modify the feedback given to the student for their homework submission.'
                  : "You can provide feedback for the student's homework submission."
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        {selectedHomework?.submissionType === 'file_upload' ? (
          <AssignGrade
            data={selectedStudent}
            onClose={() => {
              viewSubmissionDialog.onFalse();
              setTimeout(() => {
                setSelectedStudent(null);
              }, 300); // Adjust timing based on your dialog's transition (usually 200–300ms)
            }}
            isEdit
          />
        ) : (
          <AssignMarksForText data={selectedStudent} onClose={handleClose} isEdit />
        )}
      </CustomDialog>
    </Box>
  );
};
