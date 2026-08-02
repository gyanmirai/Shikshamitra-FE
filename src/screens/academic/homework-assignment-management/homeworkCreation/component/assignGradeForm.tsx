'use client';

import type { RootState } from 'src/redux/store';
import type { IDocument } from 'src/screens/academic/curriculum-management/subjectAssignment/component/type';

import { useRef } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import RubricEvaluationPanel from 'src/screens/academic/homework-assignment-management/marksAndFeedback/rubricEvaluationPanel';
import { getFileIconByType } from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/documentList';
import {
  Box,
  Grid,
  Card,
  Stack,
  Avatar,
  Button,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';
import {
  useUpdateHomeworkSubmissionStatusMutation,
  useUpdateHomeworkSubmissionFeedbackMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';

import { assignGradeValidationSchema } from './validationSchema';
import { document } from '../../assignmentCreation/studentSubmission/assignMarksForm';

import type { IAssignGradeProps } from '../type';

/**
 * Props for the AssignGrade component
 */
const AssignGrade: React.FC<IAssignGradeProps> = ({
  isEdit,
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
  const [updateSubmissionFeedback, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkSubmissionFeedbackMutation,
  });
  const [updateSubmissionStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkSubmissionStatusMutation,
  });

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      feedback: data?.feedback || '',
    },
    validationSchema: assignGradeValidationSchema,
    async onSubmit(values) {
      const isUpdate = Boolean(data?.feedback);
      try {
        await updateSubmissionFeedback({
          homeworkId: homeworkId || data?.homeworkId,
          studentId: data?.studentId,
          academicMediumId: (medium as any)?.id,
          body: {
            feedback: values.feedback,
            status: 4,
          },
        }).unwrap();

        await updateSubmissionStatus({
          homeworkId: homeworkId || data?.homeworkId,
          studentId: data?.studentId,
          academicMediumId: (medium as any)?.id,
          body: {
            status: 4, // Reviewed
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
      }
    },
  });

  const handleDownload = (doc: IDocument) => {
    window.open(doc.url, '_blank');
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={1}>
          {/* Rubric Evaluation Panel */}
          {data &&
            selectedClass &&
            selectedSubject &&
            selectedHomework?.id &&
            hasRubricAssessment && (
              <Grid size={{ xs: 12 }}>
                <RubricEvaluationPanel
                  mode="homework"
                  standardId={selectedClass}
                  subjectId={selectedSubject}
                  taskId={selectedHomework.id}
                  taskTitle={selectedHomework.label}
                  studentRow={data}
                  ensureSubmissionId={isSelectedInPerson ? ensureInPersonSubmissionId : undefined}
                />
              </Grid>
            )}

          {/* Student Profile Section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar
                  alt={data?.studentName || 'Student'}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    fontWeight: 'bold',
                  }}
                >
                  {data?.studentName?.charAt(0) || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {data?.studentName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Roll No: {data?.rollNumber || '--'}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Student Submission Section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 0, overflow: 'hidden', boxShadow: 'var(--shadows-10)' }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.neutral',
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Iconify icon="solar:document-text-bold" width={20} sx={{ color: 'info.main' }} />
                  Student Submission
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {data?.submittedContent?.trim() ? (
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {data.submittedContent}
                    </Typography>
                  </Card>
                ) : data?.submittedDocumentUrl ? (
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'background.neutral',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getFileIconByType(data.originalFileName ?? document.type ?? 'txt', 32)}
                      <Box>
                        <Typography variant="subtitle2" noWrap sx={{ maxWidth: 240 }}>
                          {data.originalFileName || 'Submitted document'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {data.submissionDate
                            ? `Submitted on ${data.submissionDate}`
                            : 'Uploaded by student'}
                        </Typography>
                      </Box>
                    </Box>

                    <Tooltip title="Preview">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDownload({
                            ...document,
                            name: data.originalFileName || document.name,
                            url: data.submittedDocumentUrl!,
                          })
                        }
                        sx={{ color: 'text.secondary' }}
                      >
                        <Iconify icon={GlobalIcons.eye} width={20} />
                      </IconButton>
                    </Tooltip>
                  </Card>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      border: (theme) => `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <Iconify
                      icon="solar:file-remove-bold-duotone"
                      width={40}
                      sx={{ color: 'text.disabled', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No file submitted by student
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Feedback Section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Feedback
              </Typography>
              <ShakingTextField error={Boolean(formik.errors.feedback)}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="feedback"
                  label="Feedback *"
                  value={formik.values.feedback}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                  helperText={formik.touched.feedback && formik.errors.feedback}
                  disabled={!isEdit}
                />
              </ShakingTextField>
            </Card>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ bgcolor: 'background.paper', p: 2.5, flexShrink: 0 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onPrevious}
          disabled={!hasPrevious}
          size="small"
          startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onNext}
          disabled={!hasNext}
          size="small"
          endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
        >
          Next
        </Button>
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
          disabled={!hasNext}
          loading={isUpdateLoading || isStatusLoading}
          onClick={(e: any) => {
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
          loading={isUpdateLoading || isStatusLoading}
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
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignGrade;
