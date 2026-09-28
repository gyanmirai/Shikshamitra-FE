'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { HomeworkSubmissionStatusOptions } from 'src/enums/homework-submission-status';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  useGetHomeworkSubmissionsQuery,
  useUpdateHomeworkSubmissionFeedbackMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';
import {
  FeedbackStatusChip,
  EvaluationStatusChip,
  dedupeEvaluationRows,
  EvaluationActionButton,
  isRowEvaluationDisabled,
} from 'src/screens/academic/homework-assignment-management/marksAndFeedback/evaluationWorkspaceUi';

import AssignGrade from '../component/assignGradeForm';

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
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.assessment}.Add`
  );
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
  const [ensureSubmissionFeedback] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkSubmissionFeedbackMutation,
  });
  // State to track the currently selected student for individual grading
  const [selectedStudent, setSelectedStudent] = useState<TStudentGrade | null>();
  const [isEditMode, setIsEditMode] = useState(true);

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
    () => dedupeEvaluationRows(homeworkSubmissions?.data || []),
    [homeworkSubmissions?.data]
  );
  const hasRubricAssessment = React.useMemo(
    () =>
      Number(selectedHomework?.defaultEvaluationMethod) === 2 ||
      normalizedData.some((row: any) => row.totalMarks !== null && row.totalMarks !== undefined),
    [normalizedData, selectedHomework?.defaultEvaluationMethod]
  );

  // Unsubmitted rows share the API's empty submission UUID. Give the table a
  // stable student-specific ID while retaining the real submission ID for actions.
  const tableData = React.useMemo(
    () =>
      normalizedData.map((row: any) => ({
        ...row,
        submissionId: row.id,
        id: row.studentId || row.id,
      })),
    [normalizedData]
  );

  const getSubmissionStudent = React.useCallback(
    (row: any): TStudentGrade => ({
      ...(row as TStudentGrade),
      id: row.submissionId ?? row.id,
    }),
    []
  );

  const selectedIndex = React.useMemo(
    () => normalizedData.findIndex((row: any) => row.studentId === selectedStudent?.studentId),
    [normalizedData, selectedStudent?.studentId]
  );
  const selectedSubmissionType =
    selectedStudent?.submissionType || selectedHomework?.submissionType;
  const selectedSubmissionTypeLabel = String(selectedSubmissionType || '').toLowerCase();
  const isSelectedInPerson =
    Number(selectedSubmissionType) === 2 ||
    selectedSubmissionTypeLabel.includes('inperson') ||
    selectedSubmissionTypeLabel.includes('in person');
  const hasRealSubmissionId = (id?: string) => Boolean(id && !id.startsWith('00000000'));

  const ensureInPersonSubmissionId = async () => {
    if (hasRealSubmissionId(selectedStudent?.id)) {
      return selectedStudent?.id ?? null;
    }

    if (!selectedStudent?.studentId || !selectedHomework?.id || !isSelectedInPerson) {
      return null;
    }

    try {
      const response = await ensureSubmissionFeedback({
        homeworkId: selectedHomework.id,
        studentId: selectedStudent.studentId,
        academicMediumId: (medium as any)?.id,
        body: {
          feedback: null,
          remarks: 'Rubric evaluation started.',
          status: 6,
        },
      }).unwrap();
      const submissionId = response?.data?.submissionId;

      if (submissionId) {
        setSelectedStudent((prev) => (prev ? { ...prev, id: submissionId, status: '6' } : prev));
      }

      return submissionId ?? null;
    } catch (error) {
      console.error('Failed to start submission', error);
      const parsed = parseApiProblemDetail(error);
      shikshaMitraToast.error({
        message: parsed.detail || 'Failed to start submission for student',
      });
      return null;
    }
  };

  const moveStudent = React.useCallback(
    (direction: 1 | -1) => {
      const nextRow = normalizedData[selectedIndex + direction];
      if (nextRow) {
        setSelectedStudent(nextRow as TStudentGrade);
      }
    },
    [normalizedData, selectedIndex]
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

  /**
   * Handler for sending notifications
   */
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const openStudentForEdit = React.useCallback(
    (row: any) => {
      setIsEditMode(true);
      setSelectedStudent(getSubmissionStudent(row));
      viewSubmissionDialog.onTrue();
    },
    [getSubmissionStudent, viewSubmissionDialog]
  );

  const openStudentForView = React.useCallback(
    (row: any) => {
      setIsEditMode(false);
      setSelectedStudent(getSubmissionStudent(row));
      viewSubmissionDialog.onTrue();
    },
    [getSubmissionStudent, viewSubmissionDialog]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        height: '100%',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents?.length > 0}
          tableId="student-submissions"
          noDataText="Homework Submission Data Not Found"
          columns={[
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
                const isDisabled = isRowEvaluationDisabled(row, selectedHomework?.submissionType);
                const text = value && value !== '-' ? value : null;

                if (isDisabled) {
                  return (
                    <CustomTooltip title="Student has not submitted homework yet" arrow>
                      <Typography
                        variant="caption"
                        fontSize="13px"
                        sx={{
                          color: 'text.disabled',
                          fontStyle: 'italic',
                          p: 0.5,
                          display: 'block',
                        }}
                      >
                        No submission
                      </Typography>
                    </CustomTooltip>
                  );
                }

                return (
                  <Box
                    onClick={() => {
                      if (canAdd) {
                        openStudentForEdit(row);
                      } else {
                        openStudentForView(row);
                      }
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
                      title={text || (canAdd ? 'Click to add feedback' : 'View feedback')}
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
                        {text || (canAdd ? 'Add feedback' : '-')}
                      </Typography>
                    </CustomTooltip>
                  </Box>
                );
              },
            },
            {
              id: 'submissionStatusLabel',
              label: 'Submission Status',
              minWidth: 150,
              filterType: 'enum',
              enumOptions: HomeworkSubmissionStatusOptions,
              align: 'left',
              render(_value, row) {
                return <EvaluationStatusChip row={row} />;
              },
            },
            {
              id: 'evaluationStatus',
              label: 'Evaluation Status',
              minWidth: 150,
              sticky: true,
              align: 'left',
              render(_value, row) {
                return <FeedbackStatusChip row={row} />;
              },
            },
            {
              id: 'actions',
              label: 'Actions',
              minWidth: 100,
              isSort: false,
              isFilter: false,
              align: 'center',
              sticky: true,
              render(value, row) {
                return (
                  <EvaluationActionButton
                    row={row}
                    canAdd={canAdd}
                    taskSubmissionType={selectedHomework?.submissionType}
                    onView={openStudentForView}
                    onEdit={openStudentForEdit}
                  />
                );
              },
            },
          ]}
          isLoading={isSubmissionsLoading || isFetching}
          data={tableData}
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
        handleClose={handleCloseDialog}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {!isEditMode
                ? 'View Homework Submission & Feedback'
                : selectedStudent?.feedback
                  ? 'Edit Feedback'
                  : 'Add Feedback'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                !isEditMode
                  ? 'View student submission details and feedback in read-only mode.'
                  : selectedStudent?.feedback
                    ? 'You can modify the feedback given to the student for their homework submission.'
                    : "You can provide feedback for the student's homework submission."
              }
            >
              <Iconify
                icon={GlobalIcons.info}
                width={16}
                height={16}
                sx={{ cursor: 'pointer' }}
                color="info.main"
              />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
        paperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <AssignGrade
          data={selectedStudent}
          onClose={handleClose}
          isEdit={isEditMode}
          homeworkId={selectedHomework?.id}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex >= 0 && selectedIndex < normalizedData.length - 1}
          onPrevious={() => moveStudent(-1)}
          onNext={() => moveStudent(1)}
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          selectedHomework={selectedHomework}
          hasRubricAssessment={hasRubricAssessment}
          isSelectedInPerson={isSelectedInPerson}
          ensureInPersonSubmissionId={ensureInPersonSubmissionId}
        />
      </CustomDialog>
    </Box>
  );
};
