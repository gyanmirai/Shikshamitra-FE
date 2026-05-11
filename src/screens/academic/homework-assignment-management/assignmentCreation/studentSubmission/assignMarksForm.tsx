'use client';

import type { IDocument } from 'src/screens/academic/curriculum-management/subjectAssignment/component/type';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
// eslint-disable-next-line import/extensions
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useState, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { getFileIconByType } from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/documentList';
import { useUpdateSubmissionFeedbackMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';
import {
  Box,
  Grid,
  Card,
  Chip,
  Stack,
  Avatar,
  Button,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import type { IAssignGradeProps } from '../../homeworkCreation/type';

export const document: IDocument = {
  id: 'doc-1',
  name: 'Lecture Notes.pdf',
  type: 'pdf',
  url: 'https://example.com/files/lecture-notes.pdf',
  size: '2.4 MB',
};

// --------------- Quick Score Config ---------------
const QUICK_SCORES = [
  { label: 'Full Marks', key: 'full', getValue: (total: number) => total },
  { label: 'Good', key: 'good', getValue: (total: number) => Math.round(total * 0.8) },
  { label: 'Half', key: 'half', getValue: (total: number) => Math.round(total / 2) },
  { label: 'Zero', key: 'zero', getValue: () => 0 },
] as const;

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
 * Props for the AssignGrade component
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
const AssignGrade: React.FC<IAssignGradeProps> = ({ isEdit, data, onClose }: IAssignGradeProps) => {
  const marksInputRef = useRef<HTMLInputElement>(null);
  const [activeQuickScore, setActiveQuickScore] = useState<string | null>(null);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const templateBtnRef = useRef<HTMLButtonElement>(null);

  const [updateSubmissionFeedback, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubmissionFeedbackMutation,
  });

  const formik = useFormik({
    initialValues: {
      marks: typeof data?.marks === 'number' ? data.marks : '',
      totalMarks: typeof data?.totalMarks === 'number' ? data.totalMarks : 25,
      feedback: data?.feedback || '',
    },
    validationSchema: Yup.object({
      marks: Yup.number()
        .required('Obtained Marks is required')
        .max(Yup.ref('totalMarks'), 'Obtained Marks cannot exceed Total Marks'),
    }),
    onSubmit(values) {
      const isUpdate = typeof data?.marks === 'number' || Boolean(data?.feedback);
      updateSubmissionFeedback({
        assignmentId: data?.id,
        studentId: data?.studentName,
        body: {
          marks: values.marks,
          totalMarks: values.totalMarks,
          feedback: values.feedback,
        },
      });
      shikshaMitraToast.success({
        message: `Feedback and marks have been ${
          isUpdate ? 'updated' : 'added'
        } successfully for ${data?.studentName ?? 'the student'}.`,
      });
      onClose(null, true);
    },
  });

  // Auto-focus obtained marks field on open
  useEffect(() => {
    const timer = setTimeout(() => {
      marksInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickScore = useCallback(
    (key: string, getValue: (total: number) => number) => {
      const total = Number(formik.values.totalMarks);
      const score = getValue(total);
      formik.setFieldValue('marks', score);
      setActiveQuickScore(key);
    },
    [formik]
  );

  const handleFeedbackChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      if (value.length <= MAX_FEEDBACK_LENGTH) {
        formik.setFieldValue('feedback', value);
        setActiveQuickScore(null);
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

  const handleDownload = (doc: IDocument) => {
    window.open(doc.url, '_blank');
  };

  const feedbackLength = formik.values.feedback?.length ?? 0;
  const counterColor =
    feedbackLength >= FEEDBACK_WARN_RED
      ? 'error.main'
      : feedbackLength >= FEEDBACK_WARN_YELLOW
        ? 'warning.main'
        : 'text.disabled';

  const totalMarks = Number(formik.values.totalMarks);
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

              {/* ── Student Submission (File) ── */}
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
                  <Box sx={{ p: 2 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'background.paper',
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: 'background.neutral' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getFileIconByType(document.type ?? 'txt', 32)}
                        <Box>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                            {document.name}
                          </Typography>
                          {document.size && (
                            <Typography variant="caption" color="text.secondary">
                              {document.size}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Tooltip title="Preview file">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(document)}
                          sx={{ color: 'text.secondary' }}
                          aria-label="Preview submission file"
                        >
                          <Iconify icon={GlobalIcons.eye} width={20} />
                        </IconButton>
                      </Tooltip>
                    </Card>
                  </Box>
                </Card>
              </Grid>

              {/* ── Marks Entry Section ── */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Marks Entry
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Total Marks – read-only, dimmed */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Total Marks"
                        fullWidth
                        name="totalMarks"
                        disabled
                        size="small"
                        value={formik.values.totalMarks}
                        sx={{ '& .MuiInputBase-root': { opacity: 0.6 } }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Iconify
                                icon="solar:lock-bold"
                                width={16}
                                sx={{ color: 'text.disabled' }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Obtained Marks – editable, auto-focused */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ShakingTextField error={!!(formik.touched.marks && formik.errors.marks)}>
                        <TextField
                          label="Obtained Marks *"
                          fullWidth
                          type="number"
                          name="marks"
                          size="small"
                          disabled={!isEdit}
                          inputRef={marksInputRef}
                          inputProps={{ min: 0, max: totalMarks }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                                >
                                  / {totalMarks}
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                          onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                          }}
                          onChange={(e) => {
                            const { value } = e.target;
                            if (value === '') {
                              formik.setFieldValue('marks', '');
                              setActiveQuickScore(null);
                              return;
                            }
                            const numericValue = parseInt(value, 10);
                            if (!Number.isNaN(numericValue) && numericValue <= totalMarks) {
                              formik.setFieldValue('marks', numericValue);
                              setActiveQuickScore(null);
                            }
                          }}
                          value={formik.values.marks}
                          error={formik.touched.marks && Boolean(formik.errors.marks)}
                          helperText={formik.touched.marks && formik.errors.marks}
                          aria-describedby="marks-error"
                        />
                      </ShakingTextField>
                    </Grid>
                  </Grid>

                  {/* Quick Score Buttons */}
                  {isEdit && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', mb: 1, display: 'block' }}
                      >
                        Quick Score
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {QUICK_SCORES.map(({ label, key, getValue }) => {
                          const score = getValue(totalMarks);
                          const isActive = activeQuickScore === key;
                          return (
                            <Button
                              key={key}
                              size="small"
                              variant={isActive ? 'contained' : 'outlined'}
                              color={isActive ? 'primary' : 'inherit'}
                              onClick={() => handleQuickScore(key, getValue)}
                              sx={{
                                fontSize: 12,
                                px: 1.5,
                                py: 0.5,
                                minWidth: 'auto',
                                transition: 'all 0.2s',
                                ...(isActive && {
                                  boxShadow: (t) => `0 0 0 3px ${t.palette.primary.light}40`,
                                }),
                              }}
                            >
                              {label} ({score})
                            </Button>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* ── Feedback Section ── */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
                  {/* Section header with Templates dropdown */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1.5}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Feedback
                    </Typography>
                    {isEdit && (
                      <Box sx={{ position: 'relative' }}>
                        <Button
                          ref={templateBtnRef}
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
                            {/* backdrop to close on outside click */}
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
              loading={isUpdateLoading}
              size="small"
              onClick={(e: any) => formik.handleSubmit(e)}
              startIcon={
                <Iconify
                  icon={data?.marks ? GlobalIcons.edit : GlobalIcons.submit}
                  width={data?.marks ? 16 : 20}
                  height={data?.marks ? 16 : 20}
                />
              }
            >
              {data?.marks ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignGrade;
