'use client';

import type { RootState } from 'src/redux/store';
import type { IDocument } from 'src/screens/academic/curriculum-management/subjectAssignment/component/type';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { getFileIconByType } from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/documentList';
import {
  StudentFeedbackContext,
  HomeworkFeedbackContext,
} from 'src/screens/academic/homework-assignment-management/marksAndFeedback/feedbackContextCards';
import { useUpdateHomeworkSubmissionFeedbackMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';
import RubricEvaluationPanel, {
  type RubricEvaluationPanelRef,
} from 'src/screens/academic/homework-assignment-management/marksAndFeedback/rubricEvaluationPanel';
import {
  Box,
  Grid,
  Card,
  Menu,
  Stack,
  Button,
  Tooltip,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';

import { assignGradeValidationSchema } from './validationSchema';

import type { IAssignGradeProps } from '../type';
import type { RubricEvaluationState } from '../../marksAndFeedback/rubricEvaluationTypes';

const FEEDBACK_MAX_LENGTH = 500;

const QUICK_TEMPLATES = [
  'Well done! Keep up the great work.',
  'Good effort! Review the highlighted areas for improvement.',
  'Excellent work! Very detailed and well-organized.',
  'Needs improvement. Please revisit the core concepts.',
  'Great start! Focus on structuring your answers better.',
];

/**
 * Props for the AssignGrade component
 */
const AssignGrade: React.FC<IAssignGradeProps> = ({
  isEdit = true,
  data,
  homeworkId,
  onClose,
  onNext,
  hasNext,
  onPrevious,
  hasPrevious,
  selectedClass,
  selectedSubject,
  selectedHomework,
  hasRubricAssessment,
  isSelectedInPerson,
  ensureInPersonSubmissionId,
}: IAssignGradeProps) => {
  const submitAndNextRef = useRef(false);
  const submissionInFlightRef = useRef(false);
  const rubricEvaluationRef = useRef<RubricEvaluationPanelRef | null>(null);
  const [rubricState, setRubricState] = useState<RubricEvaluationState | null>(null);
  const currentRubricState = rubricState?.studentId === data?.studentId ? rubricState : null;
  const isEvaluationLocked = Boolean(hasRubricAssessment && currentRubricState?.isLocked);
  const isEvaluationUnavailable = Boolean(
    hasRubricAssessment &&
    (!currentRubricState || currentRubricState.isLoading || currentRubricState.hasError)
  );
  const [isRubricSaving, setIsRubricSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const templateBtnRef = useRef<HTMLButtonElement>(null);

  const [updateSubmissionFeedback, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkSubmissionFeedbackMutation,
  });

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      feedback: data?.feedback || '',
    },
    validationSchema: assignGradeValidationSchema,
    async onSubmit(values) {
      if (submissionInFlightRef.current || !isEdit || isEvaluationUnavailable) return;
      if (isEvaluationLocked || rubricEvaluationRef.current?.isLocked) return;

      submissionInFlightRef.current = true;
      setIsSubmitting(true);
      const isUpdate = Boolean(data?.feedback);
      try {
        if (hasRubricAssessment && rubricEvaluationRef.current) {
          setIsRubricSaving(true);
          const rubricSaved = await rubricEvaluationRef.current.save();
          setIsRubricSaving(false);
          if (!rubricSaved) return;
        }

        await updateSubmissionFeedback({
          homeworkId: homeworkId || data?.homeworkId,
          studentId: data?.studentId,
          academicMediumId: (medium as any)?.id,
          body: {
            feedback: values.feedback,
            status: 4,
          },
        }).unwrap();

        shikshaMitraToast.success({
          message: `Feedback has been ${
            isUpdate ? 'updated' : 'added'
          } successfully for ${data?.studentName ?? 'the student'}.`,
        });
        if (submitAndNextRef.current && hasNext && onNext) {
          submitAndNextRef.current = false;
          onNext();
        } else {
          submitAndNextRef.current = false;
          onClose(null, true);
        }
      } catch (error) {
        console.error('Failed to submit feedback', error);
      } finally {
        submissionInFlightRef.current = false;
        setIsRubricSaving(false);
        setIsSubmitting(false);
      }
    },
  });

  const handleDownload = (doc: IDocument) => {
    window.open(doc.url, '_blank');
  };

  const submittedDocument: IDocument = {
    id: data?.id || '',
    name: data?.originalFileName || 'Submitted document',
    type: data?.originalFileName?.split('.').pop() || 'txt',
    url: data?.submittedDocumentUrl || '',
    size: '',
  };

  const handleTemplateSelect = (template: string) => {
    if (!isEdit || isEvaluationLocked || isEvaluationUnavailable) return;
    formik.setFieldValue('feedback', template);
    setTemplateMenuOpen(false);
  };

  const rawSubmissionType = data?.submissionType ?? selectedHomework?.submissionType;
  const numSubmissionType = Number(rawSubmissionType);
  const normalizedSubmissionType = String(rawSubmissionType || '').toLowerCase();
  const isInPersonSubmission =
    numSubmissionType === 2 ||
    isSelectedInPerson ||
    normalizedSubmissionType.includes('inperson') ||
    normalizedSubmissionType.includes('in person');
  const isNoSubmissionRequired =
    numSubmissionType === 3 || normalizedSubmissionType.includes('no submission');
  const isOnlineTextSubmission =
    numSubmissionType === 0 ||
    normalizedSubmissionType.includes('text') ||
    Boolean(data?.submittedContent?.trim() && !data?.submittedDocumentUrl);

  const submissionSection = (
    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', '& > *': { flex: 1 } }}>
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            maxHeight: 180,
            overflowY: 'auto',
            width: '100%',
          }}
        >
          {isInPersonSubmission ? (
            <Box
              sx={{
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  bgcolor: 'success.lighter',
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:user-check-rounded-bold" width={24} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  In-Person / Physical Submission
                </Typography>
              </Box>
            </Box>
          ) : isNoSubmissionRequired ? (
            <Box
              sx={{
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  bgcolor: 'info.lighter',
                  color: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:info-circle-bold" width={24} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  No Submission Required
                </Typography>
              </Box>
            </Box>
          ) : isOnlineTextSubmission && data?.submittedContent?.trim() ? (
            <Card
              sx={{ bgcolor: 'background.paper', boxShadow: 'none' }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1, fontWeight: 600 }}
              >
                Submitted Answer / Text:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {data.submittedContent}
              </Typography>
            </Card>
          ) : data?.submittedDocumentUrl ? (
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                bgcolor: 'background.paper',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'background.neutral',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  minWidth: 0,
                  flex: '1 1 160px',
                }}
              >
                {getFileIconByType(submittedDocument.name, 36)}
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ maxWidth: '100%', fontWeight: 600 }}
                  >
                    {data.originalFileName || 'Submitted document'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {data.submissionDate
                      ? `Submitted on ${data.submissionDate}`
                      : 'Uploaded by student'}
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1} flexShrink={0} sx={{ ml: 'auto' }}>
                <Tooltip title="Preview File">
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(submittedDocument)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon={GlobalIcons.eye} width={20} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download File">
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(submittedDocument)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon={GlobalIcons.download} width={20} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Card>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                borderRadius: 1,
              }}
            >
              <Iconify
                icon="solar:file-remove-bold-duotone"
                width={40}
                sx={{ color: 'text.disabled', mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No submission file or text provided by student
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Grid>
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={1.5}>
          {/* Student Profile Section */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ display: 'flex', '& > *': { flex: 1 } }}
          >
            <StudentFeedbackContext studentName={data?.studentName} rollNumber={data?.rollNumber} />
          </Grid>

          {/* Homework Context Section */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ display: 'flex', '& > *': { flex: 1 } }}
          >
            <HomeworkFeedbackContext
              title={selectedHomework?.title}
              description={selectedHomework?.description}
              compact
            />
          </Grid>

          {submissionSection}

          {/* Rubric Evaluation Panel */}
          {data &&
            selectedClass &&
            selectedSubject &&
            selectedHomework?.id &&
            hasRubricAssessment && (
              <Grid size={{ xs: 12 }}>
                <RubricEvaluationPanel
                  key={data.studentId}
                  ref={rubricEvaluationRef}
                  mode="homework"
                  compactLayout
                  standardId={selectedClass}
                  subjectId={selectedSubject}
                  taskId={selectedHomework.id}
                  taskTitle={selectedHomework.title}
                  studentRow={data}
                  ensureSubmissionId={isSelectedInPerson ? ensureInPersonSubmissionId : undefined}
                  readOnly={!isEdit}
                  onStateChange={setRubricState}
                />
              </Grid>
            )}

          {/* Feedback Section */}
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', '& > *': { flex: 1 } }}>
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
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                  }}
                >
                  <Iconify
                    icon="solar:chat-round-dots-bold"
                    width={18}
                    sx={{ color: 'primary.main' }}
                  />
                  Teacher Feedback & Remarks
                </Typography>

                {isEdit && (
                  <>
                    <Button
                      ref={templateBtnRef}
                      size="small"
                      variant="outlined"
                      color="inherit"
                      disabled={isEvaluationLocked || isEvaluationUnavailable || isSubmitting}
                      endIcon={
                        <Iconify
                          icon={
                            templateMenuOpen
                              ? 'solar:alt-arrow-up-bold'
                              : 'solar:alt-arrow-down-bold'
                          }
                          width={14}
                        />
                      }
                      startIcon={<Iconify icon={GlobalIcons.edit} width={14} />}
                      onClick={() => setTemplateMenuOpen(true)}
                      sx={{ fontSize: 12, py: 0.25 }}
                    >
                      Quick Templates
                    </Button>
                    <Menu
                      anchorEl={templateBtnRef.current}
                      open={templateMenuOpen}
                      onClose={() => setTemplateMenuOpen(false)}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      slotProps={{ paper: { sx: { maxWidth: 320, mt: 0.5 } } }}
                    >
                      {QUICK_TEMPLATES.map((tpl) => (
                        <MenuItem
                          key={tpl}
                          onClick={() => handleTemplateSelect(tpl)}
                          sx={{ fontSize: 13, whiteSpace: 'normal', py: 1 }}
                        >
                          {tpl}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
              </Box>

              <Box sx={{ p: 2 }}>
                {isEdit ? (
                  <>
                    <ShakingTextField error={Boolean(formik.errors.feedback)}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="feedback"
                        label="Feedback *"
                        placeholder="Provide qualitative feedback on the student's homework..."
                        value={formik.values.feedback}
                        onChange={(e) => {
                          if (e.target.value.length <= FEEDBACK_MAX_LENGTH) {
                            formik.handleChange(e);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                        helperText={formik.touched.feedback && formik.errors.feedback}
                        inputProps={{ maxLength: FEEDBACK_MAX_LENGTH }}
                        disabled={isEvaluationLocked || isEvaluationUnavailable || isSubmitting}
                      />
                    </ShakingTextField>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 0.5,
                        color:
                          formik.values.feedback.length >= FEEDBACK_MAX_LENGTH
                            ? 'error.main'
                            : 'text.disabled',
                      }}
                    >
                      {formik.values.feedback.length} / {FEEDBACK_MAX_LENGTH}
                    </Typography>
                  </>
                ) : (
                  <Box>
                    {data?.feedback ? (
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                        >
                          {data.feedback}
                        </Typography>
                      </Card>
                    ) : (
                      <Box
                        sx={{
                          p: 2.5,
                          textAlign: 'center',
                          borderRadius: 1,
                          bgcolor: 'background.neutral',
                          color: 'text.secondary',
                        }}
                      >
                        <Typography variant="body2" fontStyle="italic">
                          No feedback has been recorded for this student yet.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions
        sx={{ bgcolor: 'background.paper', p: 2, flexShrink: 0, boxShadow: 'var(--shadows-10)' }}
      >
        <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onPrevious}
            disabled={!hasPrevious || isSubmitting}
            size="small"
            startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onNext}
            disabled={!hasNext || isSubmitting}
            size="small"
            endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
          >
            Next
          </Button>
        </Stack>

        {isEdit ? (
          <>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                onClose(null, false);
              }}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="outlined"
              size="small"
              disabled={
                !hasNext ||
                isSubmitting ||
                isUpdateLoading ||
                isRubricSaving ||
                isEvaluationUnavailable
              }
              loading={isSubmitting || isUpdateLoading || isRubricSaving}
              onClick={(e: any) => {
                if (isEvaluationLocked) {
                  onNext?.();
                  return;
                }
                submitAndNextRef.current = true;
                formik.handleSubmit(e);
              }}
              startIcon={<Iconify icon="solar:double-alt-arrow-right-bold" />}
            >
              Submit & Next
            </LoadingButton>
            <LoadingButton
              variant="contained"
              size="small"
              loading={isSubmitting || isUpdateLoading || isRubricSaving}
              disabled={
                isSubmitting ||
                isUpdateLoading ||
                isRubricSaving ||
                isEvaluationLocked ||
                isEvaluationUnavailable
              }
              onClick={(e: any) => {
                submitAndNextRef.current = false;
                formik.handleSubmit(e);
              }}
              startIcon={
                <Iconify
                  icon={data?.feedback ? GlobalIcons.edit : GlobalIcons.submit}
                  width={data?.feedback ? 16 : 20}
                  height={data?.feedback ? 16 : 20}
                />
              }
            >
              {data?.feedback ? 'Update' : 'Submit'}
            </LoadingButton>
          </>
        ) : (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              onClose(null, false);
            }}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignGrade;
