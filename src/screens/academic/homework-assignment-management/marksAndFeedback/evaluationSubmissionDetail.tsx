'use client';

import type { ReactNode } from 'react';

import { Box, Alert, Button, LinearProgress } from '@mui/material';
import { useGetHomeworkSubmissionQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';
import { useGetAssignmentSubmissionQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';

import type { TStudentGrade } from '../homeworkCreation/type';

type Props = {
  mode: 'homework' | 'assignment';
  open: boolean;
  academicMediumId?: string;
  taskId?: string;
  classId: string;
  divisionId: string;
  subjectId: string;
  student?: TStudentGrade | null;
  children: (student: TStudentGrade) => ReactNode;
};

export default function EvaluationSubmissionDetail({
  mode, open, academicMediumId, taskId, classId, divisionId, subjectId, student, children,
}: Props) {
  const params = {
    academicMediumId, ClassId: classId, DivisionId: divisionId, SubjectId: subjectId,
    HomeworkId: taskId, AssignmentId: taskId, studentId: student?.studentId,
  };
  const skip = !open || !student?.studentId || !taskId || !academicMediumId;
  const homework = useGetHomeworkSubmissionQuery(params, { skip: skip || mode !== 'homework' });
  const assignment = useGetAssignmentSubmissionQuery(params, { skip: skip || mode !== 'assignment' });
  const { currentData, error, refetch } = mode === 'homework' ? homework : assignment;

  if (skip || !student) return null;
  if (error) return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" action={<Button color="inherit" onClick={() => refetch()}>Retry</Button>}>
        Unable to load this student&apos;s submission.
      </Alert>
    </Box>
  );
  if (!currentData) return (
    <Box sx={{ p: 2 }} role="status" aria-label="Loading student submission">
      <LinearProgress />
    </Box>
  );
  return children({ ...student, ...currentData });
}
