'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Stack, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useGetAssignmentSubmissionsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';
import { AssignmentSubmissionStatusOptions } from 'src/enums/assignment-submission-status';
import {
  FeedbackStatusChip,
  EvaluationFilterBar,
  EvaluationStatusChip,
  EvaluationActionButton,
  filterEvaluationRows,
  getEvaluationSummary,
  EvaluationSummaryCards,
} from 'src/screens/academic/homework-assignment-management/marksAndFeedback/evaluationWorkspaceUi';

import AssignGrade from './assignMarksForm';

import type { IStudentSubmissionsProps } from '../type';
import type { TStudentGrade } from '../../homeworkCreation/type';

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedAssignment,
  selectedClass,
  selectedDivision,
  selectedSubject,
}) => {
  const resolveTotalMarks = React.useCallback(
    (row: any): number => {
      const candidates = [
        row?.totalMarks,
        row?.assignmentTotalMarks,
        row?.maxMarks,
        selectedAssignment?.totalMarks,
      ];

      const parsed = candidates
        .map((candidate) => Number(candidate))
        .find((value) => Number.isFinite(value) && value > 0);

      if (parsed !== undefined) {
        return parsed;
      }

      return 25;
    },
    [selectedAssignment?.totalMarks]
  );

  // Local state for selected students
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.assessment}.Add`
  );

  const [selectedStudents] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
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

  const filteredData = React.useMemo(
    () => filterEvaluationRows(normalizedData, activeFilter),
    [activeFilter, normalizedData]
  );

  const summary = React.useMemo(
    () => getEvaluationSummary(normalizedData, assignmentSubmissions?.summary),
    [assignmentSubmissions?.summary, normalizedData]
  );

  const selectedIndex = React.useMemo(
    () => filteredData.findIndex((row: any) => row.studentId === selectedStudent?.studentId),
    [filteredData, selectedStudent?.studentId]
  );

  const moveStudent = React.useCallback(
    (direction: 1 | -1) => {
      const nextRow = filteredData[selectedIndex + direction];
      if (nextRow) {
        setSelectedStudent({
          ...(nextRow as TStudentGrade),
          totalMarks: resolveTotalMarks(nextRow),
        });
      }
    },
    [filteredData, resolveTotalMarks, selectedIndex]
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

  /**
   * Handler for sending notifications
   * Opens the instant notification dialog if it's not already open
   */
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const openStudent = React.useCallback(
    (row: any) => {
      setSelectedStudent({
        ...(row as TStudentGrade),
        totalMarks: resolveTotalMarks(row),
      });
      viewSubmissionDialog.onTrue();
    },
    [resolveTotalMarks, viewSubmissionDialog]
  );

  return (
    <>
      <Stack spacing={1.5}>
        <EvaluationSummaryCards summary={summary} />
        <EvaluationFilterBar value={activeFilter} onChange={setActiveFilter} />
      </Stack>
      <Box sx={{ mt: 1.5 }}>
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
            id: 'submissionType',
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
                    setSelectedStudent({
                      ...(row as TStudentGrade),
                      totalMarks: resolveTotalMarks(row),
                    });
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
            id: 'submissionStatusLabel',
            label: 'Submission Status',
            filterType: 'enum',
            enumOptions: AssignmentSubmissionStatusOptions,
            align: 'left',
            minWidth: 150,

            render(_value, row) {
              return <EvaluationStatusChip row={row} />;
            },
          },
          {
            id: 'evaluationStatus',
            label: 'Evaluation Status',
            sticky: true,
            align: 'left',
            minWidth: 150,
            render(_value, row) {
              return <FeedbackStatusChip row={row} />;
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            align: 'center',
            minWidth: 90,
            sticky: true,
            render(value, row) {
              return <EvaluationActionButton row={row} canAdd={canAdd} onOpen={openStudent} />;
            },
          },
        ]}
        isLoading={isSubmissionsLoading || isFetching}
        data={filteredData}
      />
      </Box>

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
        hasForm={false}
      >
        <AssignGrade
          data={selectedStudent}
          onClose={handleClose}
          isEdit
          assignmentId={selectedAssignment?.id}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex >= 0 && selectedIndex < filteredData.length - 1}
          onPrevious={() => moveStudent(-1)}
          onNext={() => moveStudent(1)}
        />
      </CustomDialog>
    </>
  );
};
