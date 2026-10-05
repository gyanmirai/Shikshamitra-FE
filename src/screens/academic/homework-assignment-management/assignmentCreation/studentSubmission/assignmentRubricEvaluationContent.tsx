import type { RefObject } from 'react';

import { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Grid,
  Menu,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import { ASSIGNMENT_SUBMISSION_TYPE_LABELS } from 'src/enums/assignment';
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
  submissionType?: number;
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
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
  submissionType,
  feedback,
  onFeedbackChange,
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
  const [templateAnchor, setTemplateAnchor] = useState<HTMLElement | null>(null);
  const feedbackMaxLength = 500;
  const quickTemplates = [
    'Well done! Keep up the great work.',
    'Good effort! Review the highlighted areas for improvement.',
    'Excellent work! Very detailed and well-organized.',
    'Needs improvement. Please revisit the core concepts.',
    'Great start! Focus on structuring your answers better.',
  ];

  return (
    <>
      <DialogScrollContent sx={{ pt: 3, flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', '& > *': { flex: 1 } }}>
              <StudentFeedbackContext
                studentName={student.studentName}
                rollNumber={student.rollNumber}
                grNumber={student.grNumber}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', '& > *': { flex: 1 } }}>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 1,
                      bgcolor: 'info.lighter',
                      color: 'info.main',
                    }}
                  >
                    <Iconify icon="solar:notebook-bookmark-bold-duotone" width={24} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      Assignment
                    </Typography>
                    <CustomTooltip
                      title={assignmentTitle || 'Untitled assignment'}
                      placement="right"
                      slotProps={{ tooltip: { sx: { maxWidth: 320, overflowWrap: 'anywhere' } } }}
                      arrow
                      describeChild
                    >
                      <Typography variant="subtitle1" fontWeight={600} noWrap tabIndex={0}>
                        {assignmentTitle || 'Untitled assignment'}
                      </Typography>
                    </CustomTooltip>
                  </Box>
                </Stack>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', '& > *': { flex: 1 } }}>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 1,
                      bgcolor: 'success.lighter',
                      color: 'success.main',
                    }}
                  >
                    <Iconify icon="solar:user-check-rounded-bold" width={24} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {submissionType == null
                        ? 'Submission'
                        : ASSIGNMENT_SUBMISSION_TYPE_LABELS[
                            submissionType as keyof typeof ASSIGNMENT_SUBMISSION_TYPE_LABELS
                          ] || 'Submission'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Submission type
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
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
            compactLayout
          />
          <Card sx={{ p: 0, overflow: 'hidden', boxShadow: 'var(--shadows-10)' }}>
            <Box
              sx={{
                px: 2,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.neutral',
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
              >
                <Iconify
                  icon="solar:chat-round-dots-bold"
                  width={18}
                  sx={{ color: 'primary.main' }}
                />
                Teacher Feedback & Remarks
              </Typography>
              {isEditMode && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    disabled={isSaving}
                    startIcon={<Iconify icon={GlobalIcons.edit} width={14} />}
                    endIcon={
                      <Iconify
                        icon={
                          templateAnchor ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'
                        }
                        width={14}
                      />
                    }
                    onClick={(event) => setTemplateAnchor(event.currentTarget)}
                    sx={{ fontSize: 12, py: 0.25 }}
                  >
                    Quick Templates
                  </Button>
                  <Menu
                    anchorEl={templateAnchor}
                    open={Boolean(templateAnchor)}
                    onClose={() => setTemplateAnchor(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{ paper: { sx: { maxWidth: 320, mt: 0.5 } } }}
                  >
                    {quickTemplates.map((template) => (
                      <MenuItem
                        key={template}
                        onClick={() => {
                          onFeedbackChange(template);
                          setTemplateAnchor(null);
                        }}
                        sx={{ fontSize: 13, whiteSpace: 'normal', py: 1 }}
                      >
                        {template}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Box>
            <Box sx={{ p: 2 }}>
              {isEditMode ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Feedback (optional)"
                    placeholder="Provide qualitative feedback on the student's assignment..."
                    value={feedback}
                    onChange={(event) => onFeedbackChange(event.target.value)}
                    disabled={isSaving}
                    inputProps={{ maxLength: feedbackMaxLength }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mt: 0.5,
                      color: 'text.disabled',
                    }}
                  >
                    {feedback.length} / {feedbackMaxLength}
                  </Typography>
                </>
              ) : (
                <Typography
                  variant="body2"
                  color={feedback ? 'text.primary' : 'text.secondary'}
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {feedback || 'No feedback has been recorded for this student yet.'}
                </Typography>
              )}
            </Box>
          </Card>
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
