'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, MenuList, MenuItem, Checkbox, Typography } from '@mui/material';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  ScheduleExamStatus,
  ScheduleExamStatusColor,
  ScheduleExamStatusOptions,
} from 'src/enums/schedule-exam-status';

import AssignGrade from '../component/assignGradeForm';
import AssignMarksForText from '../component/assignMarksForText';

import type { TStudentGrade, IStudentSubmissionsProps } from '../type';

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedHomework,
  handleBulkUpdate,
}) => {
  // Local state for selected students
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);

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

  // Dummy data for students
  // Dummy data for students
  const studentData = [
    {
      id: '1',
      rollNumber: '1',
      grNumber: 'GR0001',
      studentName: 'Sharma Priya Rajesh',
      homework: selectedHomework?.value || '',
      homeworkType: 'Written Assignment',
      submissionType: selectedHomework?.submissionType || 'online_text',
      submissionDate: '20-05-2025',
      dueDate: '25-05-2025',
      marks: 45,
      totalMarks: 50,
      feedback: 'Excellent analysis!',
      remarks: 'Well done on the assignment.',
      status: ScheduleExamStatus.Reviewed,
    },
    {
      id: '2',
      rollNumber: '2',
      grNumber: 'GR0002',
      studentName: 'Kumar Arjun Dinesh',
      homework: selectedHomework?.value || '',
      homeworkType: 'Written Assignment',
      submissionType: selectedHomework?.submissionType || 'online_text',
      submissionDate: '21-05-2025',
      dueDate: '25-05-2025',
      marks: 28,
      totalMarks: 30,
      feedback: 'Great understanding of concepts',
      remarks: 'Keep up the good work.',
      status: ScheduleExamStatus.Reviewed,
    },
    {
      id: '3',
      rollNumber: '3',
      grNumber: 'GR0003',
      studentName: 'Gupta Ananya Suresh',
      homework: selectedHomework?.value || '',
      homeworkType: 'Written Assignment',
      submissionType: selectedHomework?.submissionType || 'online_text',
      submissionDate: '23-05-2025',
      dueDate: '25-05-2025',
      marks: 0,
      totalMarks: 40,
      feedback: '',
      remarks: '',
      status: ScheduleExamStatus['Needs Review'],
    },
    {
      id: '4',
      rollNumber: '4',
      grNumber: 'GR0004',
      studentName: 'Singh Rohan Vikram',
      homework: selectedHomework?.value || '',
      homeworkType: 'Written Assignment',
      submissionType: selectedHomework?.submissionType || 'online_text',
      submissionDate: '24-05-2025',
      dueDate: '25-05-2025',
      marks: 24,
      totalMarks: 25,
      feedback: 'Excellent analysis!',
      remarks: 'Well done on the assignment.',
      status: ScheduleExamStatus.Reviewed,
    },
  ];

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
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {/* Show 'Assign Grade' option only when marks are not assigned */}
        {row.status === ScheduleExamStatus['Needs Review'] && (
          <MenuItem
            onClick={() => {
              setSelectedStudent(row as TStudentGrade);
              viewSubmissionDialog.onTrue();
              pop.onClose();
            }}
          >
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
            <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
            Edit Feedback
          </MenuItem>
        )}

        {/* Show 'Send Reminder' option only when homework is published */}
        {row.status === ScheduleExamStatus.Published && (
          <MenuItem onClick={() => {}}>
            <Iconify icon="mdi:bell" sx={{ height: '16px', width: '16px' }} />
            Send Reminder
          </MenuItem>
        )}
      </MenuList>
    ),
    [viewSubmissionDialog]
  );

  /**
   * Handler for sending notifications
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
        showCheckbox={selectedStudents?.length > 0}
        tableId="student-submissions"
        noDataText="Homework Submission Data Not Found"
        columns={[
          {
            id: 'checkBox',
            align: 'center',
            minWidth: '60px',
            isSort: false,
            sticky: true,
            isFilter: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={
                    studentData?.length > 0 && selectedStudents?.length === studentData?.length
                  }
                  indeterminate={
                    selectedStudents?.length > 0 && selectedStudents?.length < studentData?.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(studentData || []);
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
              );
            },
            render(value, row) {
              const isChecked = selectedStudents?.some((i: any) => i.id === row.id) || false;

              return (
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();

                    if (e.target.checked) {
                      setSelectedStudents([...selectedStudents, row]);
                    } else {
                      setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                    }
                  }}
                />
              );
            },
          },
          {
            id: 'studentName',
            label: 'Student Name/Gr No.',
            align: 'left',
            sticky: true,
            minWidth: 190,
            render: (value, row) => (
              <Box>
                <Typography variant="body2">{value}</Typography>
                <Typography variant="caption">({row.grNumber})</Typography>
              </Box>
            ),
          },
          {
            id: 'rollNumber',
            label: 'Roll No.',
            align: 'left',
            minWidth: 90,
            filterType: 'number',
          },
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
              <Box
                onClick={() => {
                  setSelectedStudent(row as TStudentGrade);
                  viewSubmissionDialog.onTrue();
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderRadius: 1,
                  },
                  p: 0.5,
                }}
              >
                <CustomTooltip
                  title={value || 'Click to add feedback'}
                  arrow
                  sx={{ textAlign: 'justify' }}
                >
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
                      color: value ? 'text.primary' : 'text.secondary',
                      fontStyle: value ? 'normal' : 'italic',
                    }}
                  >
                    {value || 'Add feedback'}
                  </Typography>
                </CustomTooltip>
              </Box>
            ),
          },
          {
            id: 'remarks',
            label: 'Remarks',
            align: 'left',
            minWidth: 150,
            render: (value, row) => (
              <CustomTooltip title={value || 'No remarks'} arrow sx={{ textAlign: 'justify' }}>
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
                    color: value ? 'text.primary' : 'text.secondary',
                    fontStyle: value ? 'normal' : 'italic',
                  }}
                >
                  {value || 'No remarks'}
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
        data={studentData}
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
              }, 300);
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
