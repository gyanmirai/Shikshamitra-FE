'use client';

import type { RootState } from 'src/redux/store';
import type { RubricEvaluationPanelRef } from 'src/screens/academic/homework-assignment-management/marksAndFeedback/rubricEvaluationPanel';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import HelpTooltip from 'src/components/help-tooltip';
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
import { AssignmentSubmissionStatusOptions } from 'src/enums/assignment-submission-status';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { SUBMISSION_TYPE_LABELS } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/learningTaskUi';
import {
  AssignmentStatus,
  evaluationUsesMarks,
  isEvaluationEnabled,
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
} from 'src/enums/assignment';
import {
  useGetAssignmentSubmissionsQuery,
  useUpdateSubmissionFeedbackMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';
import {
  FeedbackStatusChip,
  EvaluationStatusChip,
  filterEvaluationRows,
  dedupeEvaluationRows,
  EvaluationActionButton,
  isRowEvaluationDisabled,
} from 'src/screens/academic/homework-assignment-management/marksAndFeedback/evaluationWorkspaceUi';

import AssignGrade from './assignMarksForm';
import AssignmentRubricEvaluationContent from './assignmentRubricEvaluationContent';
import {
  saveAssignmentRubricAndFeedback,
  submitAssignmentRubricEvaluation,
} from './submitAssignmentRubricEvaluation';

import type { IStudentSubmissionsProps } from '../type';
import type { TStudentGrade } from '../../homeworkCreation/type';

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedAssignment,
  selectedClass,
  selectedDivision,
  selectedSubject,
  activeFilter = 'all',
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
  const [updateSubmissionFeedback] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubmissionFeedbackMutation,
  });
  // State to track the currently selected student for individual grading
  const [selectedStudent, setSelectedStudent] = useState<TStudentGrade | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const rubricEvaluationRef = React.useRef<RubricEvaluationPanelRef | null>(null);
  const rubricSaveInFlightRef = React.useRef(false);
  const [isRubricSaving, setIsRubricSaving] = useState(false);
  const [rubricFeedback, setRubricFeedback] = useState('');

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
    () => dedupeEvaluationRows(assignmentSubmissions?.data || []),
    [assignmentSubmissions?.data]
  );

  const filteredData = React.useMemo(
    () => filterEvaluationRows(normalizedData, activeFilter),
    [activeFilter, normalizedData]
  );

  // Unsubmitted rows share the API's empty submission UUID. Give the table a
  // stable student-specific ID while retaining the real submission ID for actions.
  const tableData = React.useMemo(
    () =>
      filteredData.map((row: any) => ({
        ...row,
        submissionId: row.id,
        id: row.studentId || row.id,
      })),
    [filteredData]
  );

  const selectedIndex = React.useMemo(
    () => filteredData.findIndex((row: any) => row.studentId === selectedStudent?.studentId),
    [filteredData, selectedStudent?.studentId]
  );
  const evaluationMethod =
    selectedAssignment?.evaluationMethod ??
    selectedAssignment?.defaultEvaluationMethod ??
    AssignmentEvaluationMethod.Marks;
  const evaluationEnabled = isEvaluationEnabled(
    selectedAssignment?.evaluationRequired,
    evaluationMethod
  );
  const usesRubric = evaluationMethod === AssignmentEvaluationMethod.Rubric;
  const rubricRows = usesRubric
    ? filteredData.filter(
        (row: any) => !isRowEvaluationDisabled(row, selectedAssignment?.submissionType)
      )
    : [];
  const rubricIndex = rubricRows.findIndex(
    (row: any) => row.studentId === selectedStudent?.studentId
  );
  const previousRubricRow = rubricIndex > 0 ? rubricRows[rubricIndex - 1] : null;
  const nextRubricRow = rubricIndex >= 0 ? rubricRows[rubricIndex + 1] : null;
  const requiresMarks = evaluationUsesMarks(
    selectedAssignment?.evaluationRequired,
    evaluationMethod
  );
  const selectedSubmissionType =
    selectedStudent?.submissionType ?? selectedAssignment?.submissionType;
  const selectedSubmissionTypeLabel = String(selectedSubmissionType ?? '').toLowerCase();
  const isSelectedInPerson =
    Number(selectedSubmissionType) === AssignmentSubmissionType.InPerson ||
    selectedSubmissionTypeLabel.includes('inperson') ||
    selectedSubmissionTypeLabel.includes('in person');
  const hasRealSubmissionId = (id?: string) => Boolean(id && !id.startsWith('00000000'));

  const ensureInPersonSubmissionId = async () => {
    if (hasRealSubmissionId(selectedStudent?.id)) {
      return selectedStudent?.id ?? null;
    }

    if (!selectedStudent?.studentId || !selectedAssignment?.id || !isSelectedInPerson) {
      return null;
    }

    try {
      const response = await updateSubmissionFeedback({
        assignmentId: selectedAssignment.id,
        studentId: selectedStudent.studentId,
        academicMediumId: (medium as any)?.id,
        body: {
          marks: null,
          totalMarks: null,
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
      return null;
    }
  };

  const moveStudent = React.useCallback(
    (direction: 1 | -1) => {
      const nextRow = filteredData[selectedIndex + direction];
      if (nextRow) {
        setRubricFeedback(nextRow.feedback || '');
        setSelectedStudent({
          ...(nextRow as TStudentGrade),
          totalMarks: resolveTotalMarks(nextRow),
        });
      }
    },
    [filteredData, resolveTotalMarks, selectedIndex]
  );

  const openRubricStudent = (row: TStudentGrade) => {
    setRubricFeedback(row.feedback || '');
    setSelectedStudent({ ...row, totalMarks: resolveTotalMarks(row) });
  };

  /**
   * Handles closing the view submission dialog and resetting the selected student
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedStudent(null);
        setRubricFeedback('');
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

  const openStudentForEdit = React.useCallback(
    (row: any) => {
      setIsEditMode(true);
      setRubricFeedback(row.feedback || '');
      setSelectedStudent({
        ...(row as TStudentGrade),
        id: row.submissionId ?? row.id,
        totalMarks: resolveTotalMarks(row),
      });
      viewSubmissionDialog.onTrue();
    },
    [resolveTotalMarks, viewSubmissionDialog]
  );

  const openStudentForView = React.useCallback(
    (row: any) => {
      setIsEditMode(false);
      setRubricFeedback(row.feedback || '');
      setSelectedStudent({
        ...(row as TStudentGrade),
        id: row.submissionId ?? row.id,
        totalMarks: resolveTotalMarks(row),
      });
      viewSubmissionDialog.onTrue();
    },
    [resolveTotalMarks, viewSubmissionDialog]
  );

  const handleRubricSubmit = async (advance: boolean) => {
    const rubricPanel = rubricEvaluationRef.current;
    const assignmentId = selectedAssignment?.id;
    const studentId = selectedStudent?.studentId;
    if (rubricSaveInFlightRef.current || !rubricPanel || !assignmentId || !studentId) return;
    const nextStudent = advance ? nextRubricRow : null;
    if (advance && !nextStudent) return;

    rubricSaveInFlightRef.current = true;
    setIsRubricSaving(true);
    try {
      if (
        await submitAssignmentRubricEvaluation({
          save: () =>
            saveAssignmentRubricAndFeedback({
              saveRubric: () => rubricPanel.save(),
              feedbackChanged: rubricFeedback !== (selectedStudent?.feedback || ''),
              saveFeedback: async () => {
                await updateSubmissionFeedback({
                  assignmentId,
                  studentId,
                  academicMediumId: (medium as any)?.id,
                  body: { feedback: rubricFeedback, status: 4 },
                }).unwrap();
              },
            }),
          advance,
          nextStudent,
          onAdvance: openRubricStudent,
          onClose: () => handleClose(null, true),
        })
      ) {
        shikshaMitraToast.success({ message: 'Rubric evaluation submitted successfully.' });
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Failed to save assignment feedback.',
      });
    } finally {
      rubricSaveInFlightRef.current = false;
      setIsRubricSaving(false);
    }
  };

  if (
    selectedAssignment?.status !== AssignmentStatus.Published ||
    selectedAssignment?.submissionType === AssignmentSubmissionType.NoSubmissionRequired ||
    !evaluationEnabled
  ) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">
          {selectedAssignment?.status === AssignmentStatus.Closed
            ? 'This assignment is closed. Evaluation controls are no longer available.'
            : selectedAssignment?.status !== AssignmentStatus.Published
              ? 'Publish this assignment before evaluating submissions.'
              : selectedAssignment?.submissionType === AssignmentSubmissionType.NoSubmissionRequired
                ? 'This assignment does not require student submissions.'
                : 'This assignment does not require evaluation.'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents?.length > 0}
          tableId="student-submissions"
          noDataText="No Submission Data Found"
          columns={[
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
              render(value) {
                return SUBMISSION_TYPE_LABELS[Number(value)] || value || '-';
              },
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
            ...(requiresMarks
              ? [
                  {
                    id: 'totalMarks',
                    label: 'Total Marks',
                    align: 'left' as const,
                    minWidth: 130,
                    filterType: 'number' as const,
                  },
                  {
                    id: 'marks',
                    label: 'Obtained Marks',
                    filterType: 'number' as const,
                    minWidth: 150,
                    align: 'left' as const,
                    render: (value: unknown) =>
                      value !== null && value !== undefined ? (
                        <Typography variant="caption" fontSize="13px">
                          {String(value)}
                        </Typography>
                      ) : (
                        <Typography variant="caption">-</Typography>
                      ),
                  },
                ]
              : []),
            {
              id: 'feedback',
              label: 'Feedback',
              minWidth: 180,
              align: 'left',
              render: (value, row) => {
                const isDisabled = isRowEvaluationDisabled(row, selectedAssignment?.submissionType);
                const text = value && value !== '-' ? value : null;

                if (isDisabled) {
                  return (
                    <CustomTooltip title="Student has not submitted assignment yet" arrow>
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
              minWidth: 100,
              sticky: true,
              render(value, row) {
                return (
                  <EvaluationActionButton
                    row={row}
                    canAdd={canAdd}
                    taskSubmissionType={selectedAssignment?.submissionType}
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
        disableClose={usesRubric && isRubricSaving}
        handleClose={() => {
          viewSubmissionDialog.onFalse();
          setTimeout(() => {
            setSelectedStudent(null);
            setRubricFeedback('');
          }, 300);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {!isEditMode
                ? 'View Assignment Submission & Feedback'
                : usesRubric
                  ? selectedStudent?.feedback
                    ? 'Edit Feedback'
                    : 'Add Feedback'
                  : `${selectedStudent?.marks || selectedStudent?.feedback ? 'Edit' : 'Add'} ${requiresMarks ? 'Feedback & Marks' : 'Feedback'}`}
            </Typography>
            <HelpTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                !isEditMode
                  ? 'View student submission details, marks, and feedback in read-only mode.'
                  : usesRubric
                    ? "Evaluate the student's submission with the configured rubric."
                    : requiresMarks
                      ? "Provide feedback and marks for the student's assignment submission."
                      : "Provide feedback for the student's assignment submission."
              }
            >
              <Iconify
                icon={GlobalIcons.info}
                width={16}
                height={16}
                sx={{ cursor: 'pointer' }}
                color="info.main"
              />
            </HelpTooltip>
          </Box>
        }
        maxWidth="md"
        paperProps={{ sx: { maxHeight: '90vh' } }}
        hasForm={false}
      >
        {usesRubric &&
          selectedStudent &&
          selectedClass &&
          selectedSubject &&
          selectedAssignment?.id && (
            <AssignmentRubricEvaluationContent
              student={selectedStudent}
              standardId={selectedClass}
              subjectId={selectedSubject}
              assignmentId={selectedAssignment.id}
              assignmentTitle={selectedAssignment.title}
              submissionType={Number(
                selectedStudent.submissionType ?? selectedAssignment.submissionType
              )}
              feedback={rubricFeedback}
              onFeedbackChange={setRubricFeedback}
              ensureSubmissionId={isSelectedInPerson ? ensureInPersonSubmissionId : undefined}
              rubricRef={rubricEvaluationRef}
              isEditMode={isEditMode}
              isSaving={isRubricSaving}
              hasPrevious={Boolean(previousRubricRow)}
              hasNext={Boolean(nextRubricRow)}
              onPrevious={() => previousRubricRow && openRubricStudent(previousRubricRow)}
              onNext={() => nextRubricRow && openRubricStudent(nextRubricRow)}
              onClose={() => handleClose(null, false)}
              onSubmit={handleRubricSubmit}
            />
          )}
        {!usesRubric && (
          <AssignGrade
            data={selectedStudent}
            onClose={handleClose}
            isEdit={isEditMode}
            assignmentId={selectedAssignment?.id}
            requiresMarks={requiresMarks}
            hasPrevious={selectedIndex > 0}
            hasNext={selectedIndex >= 0 && selectedIndex < filteredData.length - 1}
            onPrevious={() => moveStudent(-1)}
            onNext={() => moveStudent(1)}
          />
        )}
      </CustomDialog>
    </>
  );
};
