'use client';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Card,
  Chip,
  Stack,
  Avatar,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import { useUpdateHomeworkSubmissionFeedbackMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';

import { assignGradeValidationSchema } from './validationSchema';

import type { IAssignGradeProps } from '../type';

// --------------- Feedback Templates ---------------
const FEEDBACK_TEMPLATES: { label: string; text: string }[] = [
  {
    label: 'Excellent',
    text: 'Excellent work! You have demonstrated a thorough understanding of the topic. Keep up the outstanding effort!',
  },
  {
    label: 'Good',
    text: 'Good job! You have shown a solid grasp of the concepts. A bit more detail in certain areas would make this perfect.',
  },
  {
    label: 'Average',
    text: 'Satisfactory work. You understand the basics, but there is room to improve depth and accuracy. Please review the key concepts.',
  },
  {
    label: 'Needs Work',
    text: 'This submission needs improvement. Please revisit the topic and ensure you address all the requirements clearly.',
  },
  {
    label: 'Incomplete',
    text: 'This submission appears incomplete. Please ensure all questions are answered and resubmit for a full evaluation.',
  },
];

const MAX_FEEDBACK_LENGTH = 500;
const FEEDBACK_WARN_YELLOW = 400;
const FEEDBACK_WARN_RED = 450;

/**
 * AssignMarksForText – Feedback modal for text-based homework submissions.
 */
const AssignMarksForText: React.FC<IAssignGradeProps> = ({
  isEdit,
  data,
  onClose,
}: IAssignGradeProps) => {
  const [updateSubmissionFeedback, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkSubmissionFeedbackMutation,
  });

  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      feedback: data?.feedback || '',
    },
    validationSchema: assignGradeValidationSchema,
    onSubmit(values) {
      const isUpdate = typeof data?.totalMarks === 'number' || Boolean(data?.feedback);
      updateSubmissionFeedback({
        homeworkId: data?.id,
        studentId: data?.studentName,
        body: {
          feedback: values.feedback,
        },
      });
      shikshaMitraToast.success({
        message: `Feedback has been ${isUpdate ? 'updated' : 'added'} successfully for ${
          data?.studentName ?? 'the student'
        }.`,
      });
      onClose(null, true);
    },
  });

  const handleFeedbackChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      if (value.length <= MAX_FEEDBACK_LENGTH) {
        formik.setFieldValue('feedback', value);
      }
    },
    [formik]
  );

  const handleApplyTemplate = useCallback(
    (text: string) => {
      formik.setFieldValue('feedback', text);
      setTemplateMenuOpen(false);
    },
    [formik]
  );

  const feedbackLength = formik.values.feedback?.length ?? 0;
  const counterColor =
    feedbackLength >= FEEDBACK_WARN_RED
      ? 'error.main'
      : feedbackLength >= FEEDBACK_WARN_YELLOW
        ? 'warning.main'
        : 'text.disabled';

  const submissionDate = data?.submissionDate
    ? new Date(data.submissionDate as any).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box
          component="form"
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onSubmit={formik.handleSubmit}
        >
          <Scrollbar sx={{ height: '500px', p: 2 }}>
            <Grid container spacing={2.5}>
              {/* ── Student Info Bar ── */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: (theme) =>
                      `1px solid ${varAlpha(theme.vars.palette.success.mainChannel, 0.24)}`,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.08),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      alt={data?.studentName || 'Student'}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'success.lighter',
                        color: 'success.darker',
                        fontWeight: 700,
                        fontSize: 16,
                        boxShadow: (theme) =>
                          `0 2px 8px ${varAlpha(theme.vars.palette.success.mainChannel, 0.24)}`,
                      }}
                    >
                      {data?.studentName?.charAt(0)?.toUpperCase() || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {data?.studentName || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Roll No: {data?.rollNumber || '--'}
                      </Typography>
                    </Box>
                  </Stack>

                  {submissionDate && (
                    <Chip
                      size="small"
                      icon={<Iconify icon="solar:clock-circle-bold" width={14} />}
                      label={`Submitted ${submissionDate}`}
                      sx={{
                        fontSize: 11,
                        height: 24,
                        bgcolor: 'success.lighter',
                        color: 'success.darker',
                        border: (theme) =>
                          `1px solid ${varAlpha(theme.vars.palette.success.mainChannel, 0.24)}`,
                        '& .MuiChip-icon': { color: 'success.main' },
                      }}
                    />
                  )}
                </Box>
              </Grid>

              {/* ── Student Submission (Text) ── */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 0, overflow: 'hidden', boxShadow: 'var(--shadows-10)' }}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.neutral',
                      borderBottom: (t) => `1px solid ${t.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Iconify
                      icon="solar:document-text-bold"
                      width={18}
                      sx={{ color: 'info.main' }}
                    />
                    <Typography variant="subtitle2">Student Submission</Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography
                      component="pre"
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        m: 0,
                        fontFamily: 'inherit',
                        color: 'text.primary',
                        p: 2,
                        bgcolor: 'background.neutral',
                        borderRadius: 1,
                        minHeight: 80,
                      }}
                    >
                      {`1. The sun rises in the east.\n2. Water boils at 100°C.\n3. Plants need water to grow.\n\nI have completed all answers as per the instructions.`}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* ── Homework Description ── */}
              <Grid size={{ xs: 12 }}>
                <Card
                  variant="outlined"
                  sx={{ borderStyle: 'dashed', boxShadow: 'var(--shadows-10)' }}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                      <Iconify
                        icon="solar:notebook-minimalistic-bold"
                        width={18}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        Homework Description
                      </Typography>
                    </Stack>
                    <Typography
                      component="pre"
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        m: 0,
                        fontFamily: 'inherit',
                        color: 'text.primary',
                        p: 2,
                        bgcolor: 'background.neutral',
                        borderRadius: 1,
                      }}
                    >
                      {`Homework Assignment: Science Fundamentals\n\nDue Date: Friday, March 15th, 2024\nInstructions: Write detailed explanations for the following scientific facts.\n\nQuestions:\n1. Explain why the sun appears to rise in the east every day\n2. Describe the process of water boiling and why it occurs at 100°C at sea level\n3. Explain the importance of water in plant growth and development\n\nAdditional Notes:\nI have completed all answers according to the given instructions and provided scientific explanations for each point.`}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* ── Feedback Section ── */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1.5}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Evaluation &amp; Feedback
                    </Typography>
                    {isEdit && (
                      <Box sx={{ position: 'relative' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          endIcon={
                            <Iconify
                              icon={
                                templateMenuOpen ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'
                              }
                              width={16}
                            />
                          }
                          startIcon={<Iconify icon="solar:document-add-bold" width={16} />}
                          onClick={() => setTemplateMenuOpen((p) => !p)}
                          sx={{ fontSize: 12, py: 0.5 }}
                          aria-haspopup="listbox"
                          aria-expanded={templateMenuOpen}
                        >
                          Quick Templates
                        </Button>

                        {templateMenuOpen && (
                          <>
                            <Box
                              onClick={() => setTemplateMenuOpen(false)}
                              sx={{ position: 'fixed', inset: 0, zIndex: 10 }}
                            />
                            <Card
                              elevation={8}
                              sx={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 6px)',
                                zIndex: 11,
                                minWidth: 220,
                                py: 0.5,
                                overflow: 'hidden',
                              }}
                              role="listbox"
                              aria-label="Feedback templates"
                            >
                              {FEEDBACK_TEMPLATES.map((tpl) => (
                                <Box
                                  key={tpl.label}
                                  role="option"
                                  tabIndex={0}
                                  onClick={() => handleApplyTemplate(tpl.text)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ')
                                      handleApplyTemplate(tpl.text);
                                  }}
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    transition: 'background-color 0.15s',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    '&:focus-visible': {
                                      outline: (t) => `2px solid ${t.palette.primary.main}`,
                                      outlineOffset: -2,
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon="solar:file-text-bold"
                                    width={16}
                                    sx={{ color: 'text.secondary' }}
                                  />
                                  <Typography variant="body2">{tpl.label}</Typography>
                                </Box>
                              ))}
                            </Card>
                          </>
                        )}
                      </Box>
                    )}
                  </Stack>

                  <ShakingTextField error={!!(formik.touched.feedback && formik.errors.feedback)}>
                    <TextField
                      multiline
                      rows={4}
                      fullWidth
                      size="small"
                      name="feedback"
                      disabled={!isEdit}
                      placeholder="Provide constructive feedback to help the student improve..."
                      value={formik.values.feedback}
                      onChange={handleFeedbackChange}
                      error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                      helperText={formik.touched.feedback && formik.errors.feedback}
                      inputProps={{
                        maxLength: MAX_FEEDBACK_LENGTH,
                        'aria-label': 'Feedback textarea',
                      }}
                    />
                  </ShakingTextField>

                  {/* Character counter */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.5,
                      color: counterColor,
                      transition: 'color 0.2s',
                    }}
                    aria-live="polite"
                  >
                    {feedbackLength} / {MAX_FEEDBACK_LENGTH}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Scrollbar>

          <Divider />

          <DialogActions sx={{ bgcolor: 'background.paper', p: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => onClose(null, false)}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              size="small"
              loading={isUpdateLoading}
              onClick={(e: any) => formik.handleSubmit(e)}
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
        </Box>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignMarksForText;
