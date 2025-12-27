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
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, MenuList, MenuItem, Checkbox, Typography } from '@mui/material';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  ScheduleExamStatus,
  ScheduleExamStatusColor,
  ScheduleExamStatusOptions,
} from 'src/enums/schedule-exam-status';
import { useGetAssignmentSubmissionsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';

import AssignGrade from './assignMarksForm';
import AssignMarksForText from './assignMarksForText';

import type { IStudentSubmissionsProps } from '../type';
import type { TStudentGrade } from '../../homeworkCreation/type';

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedAssignment,
  selectedClass,
  selectedDivision,
  selectedSubject,
}) => {
  // Local state for selected students
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const {
    data: assignmentSubmissions,
    isLoading: isSubmissionsLoading,
    refetch: refetchAssignmentSubmissions,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentSubmissionsQuery,
    params: {
      academicMediumId: medium?.id,
      ClassId: selectedClass,
      DivisionId: selectedDivision,
      SubjectId: selectedSubject,
      AssignmentId: selectedAssignment?.id,
    },
  });
  // State to track the currently selected student for individual grading
  const [selectedStudent, setSelectedStudent] = useState<TStudentGrade | null>(null);

  // Dialog control for sending instant notifications
  const sendInstantNotificationDialogValue = useBoolean();
  // Dialog control for single student grade assignment
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch
  const dispatch = useDispatch();
  // Dialog control for viewing student submission details
  const viewSubmissionDialog = useBoolean();

  // Dummy data for students
  const studentData = [
    {
      id: '1',
      grNo: 'GR001',
      rollNumber: '101',
      studentName: 'Mehta Aarav Kumar',
      assignment: 'Math Assignment 1',
      assignmentType: 'Practice',
      submissionType: 'online',
      submissionDate: '20-05-2025',
      dueDate: '25-05-2025',
      marks: 18,
      totalMarks: 25,
      feedback: 'Well done!',
      status: ScheduleExamStatus.Reviewed,
    },
    {
      id: '2',
      grNo: 'GR002',
      rollNumber: '102',
      studentName: 'Patel Nisha Rajesh',
      assignment: 'Science Homework',
      assignmentType: 'Practice',
      submissionType: 'file_upload',
      submissionDate: '20-05-2025',
      dueDate: '22-05-2025',
      marks: null,
      totalMarks: 25,
      feedback: '',
      status: ScheduleExamStatus['Needs Review'],
    },
    {
      id: '3',
      grNo: 'GR003',
      rollNumber: '103',
      studentName: 'Shah Ravi Mukesh',
      assignment: 'English Essay',
      assignmentType: 'Practice',
      submissionType: 'online',
      submissionDate: '20-05-2025',
      dueDate: '23-05-2025',
      marks: 15,
      totalMarks: 25,
      feedback: 'Good effort.',
      status: ScheduleExamStatus.Reviewed,
    },
    {
      id: '4',
      grNo: 'GR004',
      rollNumber: '104',
      studentName: 'Desai Sneha Prakash',
      assignment: 'History Worksheet',
      assignmentType: 'Practice',
      submissionType: 'file_upload',
      submissionDate: '20-05-2025',
      dueDate: '21-05-2025',
      marks: 20,
      totalMarks: 25,
      feedback: '',
      status: ScheduleExamStatus.Reviewed,
    },
  ];

  /**
   * Handles closing the view submission dialog and resetting the selected student
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedStudent(null);
        dispatch(setIsChanges(false));
      }, 300); // Delay can be adjusted (200ms is typical for smooth UX)
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      viewSubmissionDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      viewSubmissionDialog.onFalse();
      resetState();
    }
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {row.status === ScheduleExamStatus['Needs Review'] && (
          <MenuItem
            onClick={() => {
              setSelectedStudent(row as TStudentGrade);
              viewSubmissionDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-circle" />
            Assign Marks
          </MenuItem>
        )}
        {row.status === ScheduleExamStatus.Reviewed && (
          <MenuItem
            onClick={() => {
              setSelectedStudent(row as TStudentGrade);
              viewSubmissionDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
            Edit Marks
          </MenuItem>
        )}
        {row.status === ScheduleExamStatus.Draft && (
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
   * Opens the instant notification dialog if it's not already open
   */
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents?.length > 0}
        tableId="student-submissions"
        noDataText="No Submission Data Found"
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
            label: 'Student Name/GR No.',
            align: 'left',
            sticky: true,
            minWidth: 190,
            render: (value, row) => (
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({row.grNo})
                </Typography>
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
          {
            id: 'assignmentType',
            label: 'Type',
            align: 'left',
            minWidth: 100,
          },
          {
            id: 'submissionDate',
            label: 'Submission Date',
            align: 'left',
            minWidth: 160,
            filterType: 'date',
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            minWidth: 140,
            filterType: 'date',
          },
          {
            id: 'totalMarks',
            label: 'Total Marks',
            align: 'left',
            minWidth: 130,
            filterType: 'number',
          },
          {
            id: 'marks',
            label: 'Obtained Marks',
            filterType: 'number',
            minWidth: 150,
            align: 'left',
            render: (value, row) =>
              value ? (
                <Typography variant="caption" fontSize="13px">
                  {value}
                </Typography>
              ) : (
                <Typography variant="caption">-</Typography>
              ),
          },
          {
            id: 'feedback',
            label: 'Feedback',
            minWidth: 180,
            align: 'left',
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
                <CustomTooltip title={value || 'Click to add feedback'} arrow>
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
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            sticky: true,
            enumOptions: ScheduleExamStatusOptions,
            align: 'left',
            minWidth: 80,
            render(value, row) {
              const color = ScheduleExamStatusColor[value as ScheduleExamStatus] as LabelColor;
              return <Label color={color}>{ScheduleExamStatus[value]}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Action',
            isSort: false,
            isFilter: false,
            align: 'left',
            minWidth: 50,
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
        handleClose={() => {
          viewSubmissionDialog.onFalse();
          setTimeout(() => {
            setSelectedStudent(null);
          }, 300);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedStudent?.marks ? 'Edit Feedback & Marks' : 'Add Feedback & Marks'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedStudent?.marks
                  ? 'You can modify the feedback & marks given to the student for their assignment submission.'
                  : "You can provide feedback & marks for the student's assignment submission."
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        {selectedAssignment?.submissionType === 1 ? (
          <AssignGrade data={selectedStudent} onClose={handleClose} isEdit />
        ) : (
          <AssignMarksForText data={selectedStudent} onClose={handleClose} isEdit />
        )}
      </CustomDialog>
    </>
  );
};
