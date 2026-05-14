import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useRef, useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useUpdateStudentMarksMutation } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import {
  Box,
  Card,
  Chip,
  Grid,
  Menu,
  Stack,
  Avatar,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import type { IAssignGradeProps } from '../type';

const FEEDBACK_MAX_LENGTH = 500;

const QUICK_TEMPLATES = [
  'Well done! Keep up the great work.',
  'Good effort! Review the highlighted areas for improvement.',
  'Excellent work! Very detailed and well-organized.',
  'Needs improvement. Please revisit the core concepts.',
  'Great start! Focus on structuring your answers better.',
];

const AssignGrade: React.FC<IAssignGradeProps> = ({ onClose, data }: IAssignGradeProps) => {
  const marksInputRef = useRef<HTMLInputElement>(null);
  const templateBtnRef = useRef<HTMLButtonElement>(null);
  const [activeQuickScore, setActiveQuickScore] = useState<string | null>(null);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);

  const [updateStudentMarks, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentMarksMutation,
  });

  const formik = useFormik({
    initialValues: {
      marks: typeof data?.obtainedMarks === 'number' ? data.obtainedMarks : '',
      totalMarks: typeof data?.totalMarks === 'number' ? data.totalMarks : '',
      feedback: data?.feedback || '',
    },
    validationSchema: Yup.object({
      marks: Yup.number()
        .typeError('Obtained Marks must be a number')
        .required('Obtained Marks is required')
        .min(0, 'Marks cannot be negative')
        .max(Yup.ref('totalMarks'), 'Obtained Marks cannot exceed Total Marks'),
    }),
    async onSubmit(values) {
      const examId = data?.examId;
      const studentId = data?.id ?? (data as any)?.studentId;
      const subjectId = data?.subjectId;

      if (!examId || !studentId || !subjectId) {
        console.error('[AssignGrade] Missing required params:', { examId, studentId, subjectId });
        return;
      }

      const isUpdate = typeof data?.marks === 'number';
      const studentName = data?.studentName || 'Student';

      try {
        await updateStudentMarks({
          examId,
          studentId,
          subjectId,
          body: {
            marks: Number(values.marks),
            totalMarks: Number(values.totalMarks),
            feedback: values.feedback,
          },
        }).unwrap();

        onClose?.(null, true);
        shikshaMitraToast.success({
          message: isUpdate
            ? `Marks updated successfully for ${studentName}`
            : `Marks assigned successfully for ${studentName}`,
        });
      } catch (error: any) {
        console.error('[AssignGrade] Failed to update marks:', error);
      }
    },
  });

  const totalMarks = Number(formik.values.totalMarks) || 0;

  const quickScores = [
    { label: `Full Marks (${totalMarks})`, key: 'full', value: totalMarks },
    {
      label: `Good (${Math.floor(totalMarks * 0.8)})`,
      key: 'good',
      value: Math.floor(totalMarks * 0.8),
    },
    {
      label: `Half (${Math.floor(totalMarks / 2)})`,
      key: 'half',
      value: Math.floor(totalMarks / 2),
    },
    { label: 'Zero (0)', key: 'zero', value: 0 },
  ];

  const handleQuickScore = (key: string, value: number) => {
    setActiveQuickScore(key);
    formik.setFieldValue('marks', value);
    marksInputRef.current?.focus();
  };

  const handleTemplateSelect = (template: string) => {
    formik.setFieldValue('feedback', template);
    setTemplateMenuOpen(false);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Scrollbar sx={{ height: '500px', p: 2 }}>
            <Grid container spacing={2}>
              {/* Student Profile */}
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
                      height: 4,
                      background: (theme) =>
                        `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    }}
                  />
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
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
                          Roll No: {data?.rollNo || '—'}
                          {data?.examName ? ` • ${data.examName}` : ''}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* Marks Entry */}
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
                      Marks Entry
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Total Marks"
                          fullWidth
                          disabled
                          name="totalMarks"
                          size="small"
                          value={formik.values.totalMarks}
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

                      <Grid size={{ xs: 12, md: 6 }}>
                        <ShakingTextField error={!!(formik.touched.marks && formik.errors.marks)}>
                          <TextField
                            label="Obtained Marks *"
                            fullWidth
                            type="number"
                            name="marks"
                            inputRef={marksInputRef}
                            placeholder={`0–${totalMarks}`}
                            size="small"
                            value={formik.values.marks}
                            inputProps={{ min: 0, max: totalMarks }}
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
                              setActiveQuickScore(null);
                              const { value } = e.target;
                              if (value === '') {
                                formik.setFieldValue('marks', '');
                                return;
                              }
                              const numeric = parseInt(value, 10);
                              if (!Number.isNaN(numeric) && numeric <= totalMarks) {
                                formik.setFieldValue('marks', numeric);
                              }
                            }}
                            error={formik.touched.marks && Boolean(formik.errors.marks)}
                            helperText={formik.touched.marks && formik.errors.marks}
                          />
                        </ShakingTextField>
                      </Grid>

                      {/* Quick Score chips */}
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', mb: 0.75, display: 'block' }}
                        >
                          Quick Score
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {quickScores.map((qs) => (
                            <Chip
                              key={qs.key}
                              label={qs.label}
                              size="small"
                              variant={activeQuickScore === qs.key ? 'filled' : 'outlined'}
                              color={activeQuickScore === qs.key ? 'primary' : 'default'}
                              onClick={() => handleQuickScore(qs.key, qs.value)}
                              sx={{
                                cursor: 'pointer',
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

              {/* Feedback */}
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

                    <Button
                      ref={templateBtnRef}
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<Iconify icon={GlobalIcons.edit} width={14} />}
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
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <ShakingTextField error={!!(formik.touched.feedback && formik.errors.feedback)}>
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
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose?.(null, false)}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              loading={isUpdateLoading}
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
