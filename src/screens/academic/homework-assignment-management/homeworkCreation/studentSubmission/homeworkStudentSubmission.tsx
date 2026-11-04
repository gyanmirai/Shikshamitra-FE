'use client';

import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import React, { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  dedupeEvaluationRows,
} from 'src/screens/academic/homework-assignment-management/marksAndFeedback/evaluationWorkspaceUi';
import { getEvaluationSubmissionColumns } from 'src/screens/academic/homework-assignment-management/marksAndFeedback/evaluationSubmissionColumns';
import {
  useGetHomeworkSubmissionsQuery,
  useUpdateHomeworkSubmissionFeedbackMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';

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
    currentData: homeworkSubmissions,
    error: submissionsError,
    refetch: refetchSubmissions,
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
          tableId="homework-evaluation-submissions"
          tableTitle="Homework Submissions"
          noDataText="No student submissions match the selected task."
          error={submissionsError}
          onRetry={() => refetchSubmissions()}
          wrapperProps={{ sx: { flex: 1, minHeight: 0, height: { xs: 'auto', md: 1 } } }}
          tableContainerProps={{ sx: { height: { xs: 'auto', md: 1 } } }}
          columns={getEvaluationSubmissionColumns({
            assignment: false,

            canAdd,
            taskSubmissionType: selectedHomework?.submissionType,
            onView: openStudentForView,
            onEdit: openStudentForEdit,
          })}
          isLoading={isSubmissionsLoading || (isFetching && !homeworkSubmissions)}
          isRefreshing={isFetching && Boolean(homeworkSubmissions)}
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
          !isEditMode
            ? 'View Homework Submission & Feedback'
            : selectedStudent?.feedback
              ? 'Edit Feedback'
              : 'Add Feedback'
        }
        titleInfo={
          !isEditMode
            ? 'View student submission details and feedback in read-only mode.'
            : selectedStudent?.feedback
              ? 'You can modify the feedback given to the student for their homework submission.'
              : "You can provide feedback for the student's homework submission."
        }
        hasForm={isEditMode}
        maxWidth="md"
        paperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <AssignGrade
          key={selectedStudent?.studentId}
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
