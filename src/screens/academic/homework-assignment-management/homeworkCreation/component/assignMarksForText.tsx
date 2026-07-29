'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
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
  Menu,
  Stack,
  Avatar,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useUpdateHomeworkSubmissionStatusMutation,
  useUpdateHomeworkSubmissionFeedbackMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';

import { assignGradeValidationSchema } from './validationSchema';

import type { IAssignGradeProps } from '../type';

const FEEDBACK_MAX_LENGTH = 500;

const QUICK_TEMPLATES = [
  'Well done! Keep up the great work.',
  'Good effort! Review the highlighted areas for improvement.',
  'Excellent work! Very detailed and well-organized.',
  'Needs improvement. Please revisit the core concepts.',
  'Great start! Focus on structuring your answers better.',
];

/**
 * AssignMarksForText – Feedback modal for text-based homework submissions.
 */
const AssignMarksForText: React.FC<IAssignGradeProps> = ({
  isEdit,
  data,
  homeworkId,
  onClose,
  onNext,
  hasNext,
  onPrevious,
  hasPrevious,
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

  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const templateBtnRef = useRef<HTMLButtonElement>(null);
  const submittedContent = data?.submittedContent?.trim();

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
          message: `Feedback has been ${isUpdate ? 'updated' : 'added'} successfully for ${data?.studentName ?? 'the student'
            }.`,
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

  const handleTemplateSelect = (template: string) => {
    if (!isEdit) return;
    formik.setFieldValue('feedback', template);
    setTemplateMenuOpen(false);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box
          component="form"
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onSubmit={formik.handleSubmit}
        >
          <Scrollbar sx={{ flex: '1 1 auto', maxHeight: 'calc(80vh - 140px)', p: 2 }}>
            <Grid container spacing={1}>
              {/* Student Profile Section */}
              <Grid size={{ xs: 12 }}>
                <Card
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* Accent bar */}
                  <Box
                    sx={{
                      height: 4,
                      background: (theme) =>
                        `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    }}
                  />
                  <Box sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          alt={data?.studentName || 'Student'}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontWeight: 700,
                            fontSize: 18,
                          }}
                        >
                          {data?.studentName?.charAt(0)?.toUpperCase() || 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                            {data?.studentName || '—'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Roll No: {data?.rollNumber || '—'}
                          </Typography>
                        </Box>
                      </Stack>
                      {data?.submissionDate && (
                        <Label
                          color="success"
                          variant="soft"
                          startIcon={<Iconify icon="solar:clock-circle-bold" width={14} />}
                          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          Submitted
                        </Label>
                      )}
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* ── Student Submission (Text) ── */}
              <Grid size={{ xs: 12 }}>
                <Card
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.06),
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        color: 'text.secondary',
                        letterSpacing: 0.8,
                      }}
                    >
                      <Iconify
                        icon="solar:document-text-bold"
                        width={16}
                        sx={{ color: 'info.main' }}
                      />
                      Student Submission
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    {submittedContent ? (
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
                        {submittedContent}
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 1,
                          bgcolor: 'background.neutral',
                          color: 'text.secondary',
                        }}
                      >
                        <Typography variant="body2">No text submission available.</Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'none' }}>
                    <Editor
                      editable={false}
                      onChange={() => { }}
                      isToolbarShow={false}
                      value={`
1. The sun rises in the east.
2. Water boils at 100°C.
3. Plants need water to grow.

I have completed all answers as per the instructions.`}
                    />
                    <Typography variant="subtitle2">Student Submission</Typography>
                  </Box>
                  <Box sx={{ display: 'none' }}>
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
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderStyle: 'dashed',
                    display: 'none',
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.06),
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        color: 'text.secondary',
                        letterSpacing: 0.8,
                      }}
                    >
                      <Iconify
                        icon="solar:notebook-minimalistic-bold"
                        width={16}
                        sx={{ color: 'text.secondary' }}
                      />
                      Homework Description
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography
                      component="pre"
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        m: 0,
                        fontFamily: 'inherit',
                        color: 'text.primary',
                        p: 2,
                        bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.04),
                        borderRadius: 1,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {`Homework Assignment: Science Fundamentals\n\nDue Date: Friday, March 15th, 2024\nInstructions: Write detailed explanations for the following scientific facts.\n\nQuestions:\n1. Explain why the sun appears to rise in the east every day\n2. Describe the process of water boiling and why it occurs at 100°C at sea level\n3. Explain the importance of water in plant growth and development\n\nAdditional Notes:\nI have completed all answers according to the given instructions and provided scientific explanations for each point.`}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* ── Feedback Section ── */}
              <Grid size={{ xs: 12 }}>
                <Card
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.06),
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        color: 'text.secondary',
                        letterSpacing: 0.8,
                      }}
                    >
                      <Iconify
                        icon="solar:chat-round-dots-bold"
                        width={16}
                        sx={{ color: 'primary.main' }}
                      />
                      Feedback
                    </Typography>

                    {isEdit && (
                      <>
                        <Button
                          ref={templateBtnRef}
                          size="small"
                          variant="outlined"
                          color="inherit"
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
                    <ShakingTextField
                      error={!!(formik.touched.feedback && formik.errors.feedback) || false}
                    >
                      <TextField
                        multiline
                        rows={4}
                        fullWidth
                        size="small"
                        name="feedback"
                        placeholder="Provide constructive feedback to help the student improve..."
                        value={formik.values.feedback}
                        onChange={(e) => {
                          if (e.target.value.length <= FEEDBACK_MAX_LENGTH) {
                            formik.handleChange(e);
                          }
                        }}
                        error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                        helperText={formik.touched.feedback && formik.errors.feedback}
                        disabled={!isEdit}
                        inputProps={{ maxLength: FEEDBACK_MAX_LENGTH }}
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
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Scrollbar>

          <Divider />

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
              onClick={() => onClose(null, false)}
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
        </Box>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignMarksForText;
