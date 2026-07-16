'use client';

import type { RootState } from 'src/redux/store';
import type { IDocument } from 'src/screens/academic/curriculum-management/subjectAssignment/component/type';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
// eslint-disable-next-line import/extensions
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { getFileIconByType } from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/documentList';
import {
  useUpdateSubmissionStatusMutation,
  useUpdateSubmissionFeedbackMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';
import {
  Box,
  Grid,
  Card,
  Chip,
  Menu,
  Stack,
  Avatar,
  Button,
  Divider,
  Tooltip,
  MenuItem,
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
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
const AssignGrade: React.FC<IAssignGradeProps> = ({
  isEdit,
  data,
  onClose,
  assignmentId,
  onNext,
  hasNext,
  onPrevious,
  hasPrevious,
}: IAssignGradeProps) => {
  const submitAndNextRef = useRef(false);
  const resolveTotalMarks = (value: unknown): number => {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return 25;
  };

  const marksInputRef = useRef<HTMLInputElement>(null);
  const [activeQuickScore, setActiveQuickScore] = useState<string | null>(null);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const templateBtnRef = useRef<HTMLButtonElement>(null);

  const [updateSubmissionFeedback, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubmissionFeedbackMutation,
  });

  const [updateSubmissionStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubmissionStatusMutation,
  });

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      marks: typeof data?.marks === 'number' ? data.marks : '',
      totalMarks: resolveTotalMarks((data as any)?.totalMarks),
      feedback: data?.feedback || '',
    },
    validationSchema: Yup.object({
      marks: Yup.number()
        .required('Obtained Marks is required')
        .max(Yup.ref('totalMarks'), 'Obtained Marks cannot exceed Total Marks'),
    }),
    async onSubmit(values) {
      const isUpdate = typeof data?.marks === 'number' || Boolean(data?.feedback);
      try {
        await updateSubmissionFeedback({
          assignmentId: assignmentId || data?.id,
          studentId: data?.studentId,
          academicMediumId: (medium as any)?.id,
          body: {
            marks: values.marks,
            totalMarks: resolveTotalMarks(values.totalMarks),
            feedback: values.feedback,
          },
        }).unwrap();

        await updateSubmissionStatus({
          assignmentId: assignmentId || data?.id,
          studentId: data?.studentId,
          academicMediumId: (medium as any)?.id,
          body: {
            status: 4, // Reviewed
          },
        }).unwrap();

        shikshaMitraToast.success({
          message: `Feedback and marks have been ${
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
        console.error('Failed to submit feedback and marks', error);
      }
    },
  });

  const totalMarks = Number(formik.values.totalMarks) || 25;

  const quickScores = [
    { label: `Full Marks (${totalMarks})`, key: 'full', value: totalMarks },
    {
      label: `Half Marks (${Math.floor(totalMarks / 2)})`,
      key: 'half',
      value: Math.floor(totalMarks / 2),
    },
    { label: 'Zero (0)', key: 'zero', value: 0 },
    {
      label: `Good (${Math.floor(totalMarks * 0.8)})`,
      key: 'good',
      value: Math.floor(totalMarks * 0.8),
    },
  ];

  const handleQuickScore = (key: string, value: number) => {
    if (!isEdit) return;
    setActiveQuickScore(key);
    formik.setFieldValue('marks', value);
  };

  const handleTemplateSelect = (template: string) => {
    if (!isEdit) return;
    formik.setFieldValue('feedback', template);
    setTemplateMenuOpen(false);
  };

  const handleDownload = (doc: IDocument) => {
    window.open(doc.url, '_blank');
  };

  const formatSubmissionDate = (date: any): string => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return String(date);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box
          component="form"
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onSubmit={formik.handleSubmit}
        >
          <Scrollbar sx={{ height: '500px', p: 2 }}>
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
                            {data?.assignments ? ` • ${data.assignments}` : ''}
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
                          Submitted {formatSubmissionDate(data.submissionDate)}
                        </Label>
                      )}
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* ── Student Submission (File) ── */}
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
                  <Box sx={{ p: 2 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        transition: (theme) => theme.transitions.create('background-color'),
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        {getFileIconByType(document.type ?? 'txt', 36)}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {document.name}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {document.size}
                            {document.type ? ` • ${document.type.toUpperCase()} Document` : ''}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1} flexShrink={0}>
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(document)}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'primary.main',
                                bgcolor: (theme) =>
                                  varAlpha(theme.palette.primary.mainChannel, 0.1),
                              },
                            }}
                          >
                            <Iconify icon={GlobalIcons.eye} width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(document)}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'success.main',
                                bgcolor: (theme) =>
                                  varAlpha(theme.palette.success.mainChannel, 0.1),
                              },
                            }}
                          >
                            <Iconify icon={GlobalIcons.download} width={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Card>
                  </Box>
                </Card>
              </Grid>

              {/* Evaluation & Marks Section */}
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
                      <Iconify icon="solar:star-bold" width={16} sx={{ color: 'warning.main' }} />
                      Evaluation & Marks
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <ShakingTextField
                          error={!!(formik.touched.totalMarks && formik.errors.totalMarks)}
                        >
                          <TextField
                            label="Total Marks"
                            fullWidth
                            name="totalMarks"
                            disabled
                            size="small"
                            value={formik.values.totalMarks}
                            onChange={formik.handleChange}
                            error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                            helperText={formik.touched.totalMarks && formik.errors.totalMarks}
                          />
                        </ShakingTextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <ShakingTextField error={!!(formik.touched.marks && formik.errors.marks)}>
                          <TextField
                            label="Obtained Marks *"
                            fullWidth
                            type="number"
                            name="marks"
                            inputRef={marksInputRef}
                            disabled={!isEdit}
                            placeholder={`0-${totalMarks}`}
                            inputProps={{ min: 0, max: formik.values.totalMarks }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}
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
                              setActiveQuickScore(null);
                              if (value === '') {
                                formik.setFieldValue('marks', '');
                                return;
                              }
                              const numericValue = parseInt(value, 10);
                              if (
                                !Number.isNaN(numericValue) &&
                                numericValue <= Number(formik.values.totalMarks)
                              ) {
                                formik.setFieldValue('marks', numericValue);
                              }
                            }}
                            size="small"
                            value={formik.values.marks}
                            error={formik.touched.marks && Boolean(formik.errors.marks)}
                            helperText={formik.touched.marks && formik.errors.marks}
                          />
                        </ShakingTextField>
                      </Grid>

                      {/* Quick Score Shortcuts */}
                      <Grid size={{ xs: 12 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {quickScores.map((qs) => (
                            <Chip
                              key={qs.key}
                              label={qs.label}
                              size="small"
                              variant={activeQuickScore === qs.key ? 'filled' : 'outlined'}
                              color={activeQuickScore === qs.key ? 'primary' : 'default'}
                              onClick={() => handleQuickScore(qs.key, qs.value)}
                              disabled={!isEdit}
                              sx={{
                                cursor: isEdit ? 'pointer' : 'not-allowed',
                                fontWeight: activeQuickScore === qs.key ? 600 : 400,
                                transition: (theme) =>
                                  theme.transitions.create([
                                    'background-color',
                                    'color',
                                    'border-color',
                                  ]),
                                ...(activeQuickScore !== qs.key && {
                                  borderColor: (theme) =>
                                    varAlpha(theme.palette.grey['500Channel'], 0.32),
                                  '&:hover': {
                                    borderColor: 'text.primary',
                                    bgcolor: (theme) =>
                                      varAlpha(theme.palette.grey['500Channel'], 0.08),
                                  },
                                }),
                              }}
                            />
                          ))}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>

              {/* Feedback Section */}
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
                          slotProps={{
                            paper: {
                              sx: { maxWidth: 320, mt: 0.5 },
                            },
                          }}
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
                    <ShakingTextField error={!!(formik.touched.feedback && formik.errors.feedback)}>
                      <TextField
                        multiline
                        size="small"
                        disabled={!isEdit}
                        rows={4}
                        fullWidth
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

          <DialogActions sx={{ bgcolor: 'background.paper', p: 2 }}>
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
              loading={isUpdateLoading || isStatusLoading}
              disabled={!hasNext}
              size="small"
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
              loading={isUpdateLoading || isStatusLoading}
              size="small"
              onClick={(e: any) => {
                submitAndNextRef.current = false;
                formik.handleSubmit(e);
              }}
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
