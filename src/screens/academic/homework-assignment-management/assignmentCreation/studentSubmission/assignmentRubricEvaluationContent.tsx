import type { RefObject } from 'react';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';
import { StudentFeedbackContext } from 'src/screens/academic/homework-assignment-management/marksAndFeedback/feedbackContextCards';
import RubricEvaluationPanel, {
  type RubricEvaluationPanelRef,
} from 'src/screens/academic/homework-assignment-management/marksAndFeedback/rubricEvaluationPanel';

import type { TStudentGrade } from '../../homeworkCreation/type';

type Props = {
  student: TStudentGrade & { grNumber?: string };
  standardId: string;
  subjectId: string;
  assignmentId: string;
  assignmentTitle?: string;
  ensureSubmissionId?: () => Promise<string | null>;
  rubricRef: RefObject<RubricEvaluationPanelRef | null>;
  isEditMode: boolean;
  isSaving: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onSubmit: (advance: boolean) => void;
};

export default function AssignmentRubricEvaluationContent({
  student,
  standardId,
  subjectId,
  assignmentId,
  assignmentTitle,
  ensureSubmissionId,
  rubricRef,
  isEditMode,
  isSaving,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onClose,
  onSubmit,
}: Props) {
  const isReviewed = Number(student.status) === 4 || student.evaluationStatus === 'Reviewed';

  return (
    <>
      <DialogScrollContent sx={{ p: { xs: 1, sm: 1.5 }, flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5}>
          <StudentFeedbackContext
            title="Student Details"
            studentName={student.studentName}
            rollNumber={student.rollNumber}
            grNumber={student.grNumber}
          />
          <RubricEvaluationPanel
            key={student.studentId}
            ref={rubricRef}
            mode="assignment"
            standardId={standardId}
            subjectId={subjectId}
            taskId={assignmentId}
            taskTitle={assignmentTitle}
            studentRow={student}
            ensureSubmissionId={ensureSubmissionId}
            readOnly={!isEditMode}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions
        sx={{ p: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}`, flexShrink: 0 }}
      >
        <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={onPrevious}
            disabled={!hasPrevious || isSaving}
            startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={onNext}
            disabled={!hasNext || isSaving}
            endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
          >
            Next
          </Button>
        </Stack>
        {isEditMode ? (
          <>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onClose}
              disabled={isSaving}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="outlined"
              size="small"
              loading={isSaving}
              disabled={!hasNext || isSaving}
              onClick={() => onSubmit(true)}
              startIcon={<Iconify icon="solar:double-alt-arrow-right-bold" />}
            >
              Submit & Next
            </LoadingButton>
            <LoadingButton
              variant="contained"
              size="small"
              loading={isSaving}
              disabled={isSaving}
              onClick={() => onSubmit(false)}
              startIcon={<Iconify icon={isReviewed ? GlobalIcons.edit : GlobalIcons.submit} />}
            >
              {isReviewed ? 'Update' : 'Submit'}
            </LoadingButton>
          </>
        ) : (
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </>
  );
}
