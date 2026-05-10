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
import { Box, MenuList, MenuItem, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useGetAssignmentSubmissionsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';
import {
  AssignmentSubmissionStatus,
  AssignmentSubmissionStatusColor,
  AssignmentSubmissionStatusOptions,
} from 'src/enums/assignment-submission-status';

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

  const [selectedStudents] = useState<any[]>([]);
  const {
    data: assignmentSubmissions,
    isLoading: isSubmissionsLoading,
    isFetching,
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

  const normalizedData = React.useMemo(
    () => assignmentSubmissions?.data || [],
    [assignmentSubmissions?.data]
  );

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
        {/* Assign marks after student submission */}
        {[
          AssignmentSubmissionStatus.Submitted,
          AssignmentSubmissionStatus.NeedsReview,
          AssignmentSubmissionStatus.Late,
        ].includes(row.status) && (
          <MenuItem
            onClick={() => {
              setSelectedStudent(row as TStudentGrade);
              viewSubmissionDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:clipboard-check-outline" />
            Assign Marks
          </MenuItem>
        )}

        {/* Edit/View Feedback or Marks */}
        {row.status === AssignmentSubmissionStatus.Reviewed && (
          <MenuItem
            onClick={() => {
              setSelectedStudent(row as TStudentGrade);
              viewSubmissionDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
            Edit/View Marks
          </MenuItem>
        )}

        {/* Reminder for pending students */}
        {row.status === AssignmentSubmissionStatus.Pending && (
          <MenuItem onClick={() => {}}>
            <Iconify icon="mdi:bell-outline" sx={{ height: '16px', width: '16px' }} />
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
          // {
          //   id: 'checkBox',
          //   align: 'center',
          //   minWidth: '60px',
          //   isSort: false,
          //   sticky: true,
          //   isFilter: false,
          //   label: '',
          //   renderColumn() {
          //     return (
          //       <Checkbox
          //         checked={
          //           studentData?.length > 0 && selectedStudents?.length === studentData?.length
          //         }
          //         indeterminate={
          //           selectedStudents?.length > 0 && selectedStudents?.length < studentData?.length
          //         }
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedStudents(studentData || []);
          //           } else {
          //             setSelectedStudents([]);
          //           }
          //         }}
          //       />
          //     );
          //   },
          //   render(value, row) {
          //     const isChecked = selectedStudents?.some((i: any) => i.id === row.id) || false;

          //     return (
          //       <Checkbox
          //         checked={isChecked}
          //         onChange={(e) => {
          //           e.stopPropagation();

          //           if (e.target.checked) {
          //             setSelectedStudents([...selectedStudents, row]);
          //           } else {
          //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
          //           }
          //         }}
          //       />
          //     );
          //   },
          // },
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
                  ({row.grNumber})
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
            render: (value, row) => {
              const text = value && value !== '-' ? value : null;
              return (
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
                  <CustomTooltip title={text || 'Click to add feedback'} arrow>
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
                        color: text ? 'text.primary' : 'text.secondary',
                        fontStyle: text ? 'normal' : 'italic',
                      }}
                    >
                      {text || 'Add feedback'}
                    </Typography>
                  </CustomTooltip>
                </Box>
              );
            },
          },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            sticky: true,
            enumOptions: AssignmentSubmissionStatusOptions,
            align: 'left',
            minWidth: 80,

            render(value) {
              if (value === undefined || value === null)
                return <Typography variant="body2">-</Typography>;

              const color = (AssignmentSubmissionStatusColor[value as AssignmentSubmissionStatus] ||
                'default') as LabelColor;

              const label =
                AssignmentSubmissionStatus[value as AssignmentSubmissionStatus] ||
                `Unknown (${value})`;

              return <Label color={color}>{label}</Label>;
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
        isLoading={isSubmissionsLoading || isFetching}
        data={normalizedData}
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
          <AssignGrade
            data={selectedStudent}
            onClose={handleClose}
            isEdit
            assignmentId={selectedAssignment?.id}
          />
        ) : (
          <AssignMarksForText
            data={selectedStudent}
            onClose={handleClose}
            isEdit
            assignmentId={selectedAssignment?.id}
          />
        )}
      </CustomDialog>
    </>
  );
};
