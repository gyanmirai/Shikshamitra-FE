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
import { useGetHomeworkSubmissionsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';
import {
  HomeworkSubmissionStatus,
  HomeworkSubmissionStatusColor,
  HomeworkSubmissionStatusOptions,
} from 'src/enums/homework-submission-status';

import AssignGrade from '../component/assignGradeForm';
import AssignMarksForText from '../component/assignMarksForText';

import type { TStudentGrade, IStudentSubmissionsProps } from '../type';

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedClass,
  selectedDivision,
  selectedSubject,
  selectedHomework,
  handleBulkUpdate,
}) => {
  // Local state for selected students
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const {
    data: homeworkSubmissions,
    isLoading: isSubmissionsLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworkSubmissionsQuery,
    params: {
      academicMediumId: (medium as any)?.id,
      ClassId: selectedClass,
      DivisionId: selectedDivision,
      SubjectId: selectedSubject,
      HomeworkId: selectedHomework?.id,
    },
    options: {
      skip: !selectedClass || !selectedDivision || !selectedSubject || !selectedHomework?.id,
    },
  });
  // State to track the currently selected student for individual grading
  const [selectedStudent, setSelectedStudent] = useState<TStudentGrade | null>();

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
    () => homeworkSubmissions?.data || [],
    [homeworkSubmissions?.data]
  );

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
        {/* Reminder for pending students */}
        {row.status === HomeworkSubmissionStatus.Pending && (
          <MenuItem onClick={() => {}}>
            <Iconify icon="mdi:bell-outline" sx={{ height: '16px', width: '16px' }} />
            Send Reminder
          </MenuItem>
        )}

        {/* Give feedback after submission */}
        {[
          HomeworkSubmissionStatus.Submitted,
          HomeworkSubmissionStatus.NeedsReview,
          HomeworkSubmissionStatus.Late,
        ].includes(row.status) && (
          <MenuItem
            onClick={() => {
              setSelectedStudent(row as TStudentGrade);
              viewSubmissionDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:comment-check-outline" />
            Give Feedback
          </MenuItem>
        )}

        {/* Edit/View Feedback or Marks */}
        {row.status === HomeworkSubmissionStatus.Reviewed && (
          <MenuItem
            onClick={() => {
              setSelectedStudent(row);
              viewSubmissionDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
            Edit/View Feedback
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
    <>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents?.length > 0}
        tableId="student-submissions"
        noDataText="Homework Submission Data Not Found"
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
                  <CustomTooltip
                    title={text || 'Click to add feedback'}
                    arrow
                    sx={{ textAlign: 'justify' }}
                  >
                    <Typography
                      variant="caption"
                      fontSize="13px"
                      noWrap
                      sx={{
                        maxWidth: 0,
                        minWidth: '100%',
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
            id: 'remarks',
            label: 'Remarks',
            align: 'left',
            minWidth: 150,
            render: (value, row) => {
              const text = value && value !== '-' ? value : null;
              return (
                <CustomTooltip title={text || 'No remarks'} arrow sx={{ textAlign: 'justify' }}>
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
                    {text || 'No remarks'}
                  </Typography>
                </CustomTooltip>
              );
            },
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: 80,
            sticky: true,
            filterType: 'enum',
            enumOptions: HomeworkSubmissionStatusOptions,
            align: 'left',
            render(value, row) {
              if (value === undefined || value === null)
                return <Typography variant="body2">-</Typography>;
              const color = (HomeworkSubmissionStatusColor[value as HomeworkSubmissionStatus] ||
                'default') as LabelColor;
              const label = HomeworkSubmissionStatus[value] || `Unknown (${value})`;
              return <Label color={color}>{label}</Label>;
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
            homeworkId={selectedHomework?.id}
          />
        ) : (
          <AssignMarksForText
            data={selectedStudent}
            onClose={handleClose}
            isEdit
            homeworkId={selectedHomework?.id}
          />
        )}
      </CustomDialog>
    </>
  );
};
