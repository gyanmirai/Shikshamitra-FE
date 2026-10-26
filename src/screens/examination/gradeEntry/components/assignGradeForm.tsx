import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useId, useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetGradeScalingByIdQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import { useUpdateStudentMarksMutation } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import {
  AttendanceStatus,
  AttendanceStatusColor,
  AttendanceStatusLabel,
  AttendanceStatusOptions,
} from 'src/enums/grade-entry-status';
import {
  Box,
  Chip,
  Grid,
  Menu,
  Stack,
  Alert,
  Avatar,
  Button,
  Select,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import type { IAssignGradeProps } from '../type';

/** Calculates the grade based on custom grading scale, falling back to CBSE rules */
function calculateAutoGrade(obtained: number, total: number, scale?: any): string {
  if (total <= 0) return '';

  if (scale && Array.isArray(scale.gradingScale) && scale.gradingScale.length > 0) {
    const scaleTotalMarks = Number(scale.totalMarks) || 100;
    const scaledMarks = (obtained / total) * scaleTotalMarks;

    const sortedRanges = [...scale.gradingScale].sort((a, b) => b.minMarks - a.minMarks);
    const match = sortedRanges.find((r) => scaledMarks >= r.minMarks && scaledMarks <= r.maxMarks);
    if (match) return match.grade;
  }

  const pct = (obtained / total) * 100;
  if (pct >= 91) return 'A1';
  if (pct >= 81) return 'A2';
  if (pct >= 71) return 'B1';
  if (pct >= 61) return 'B2';
  if (pct >= 51) return 'C1';
  if (pct >= 41) return 'C2';
  if (pct >= 33) return 'D';
  return 'F';
}

const GRADE_COLOR_MAP: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  A1: 'success',
  A2: 'success',
  B1: 'info',
  B2: 'info',
  C1: 'warning',
  C2: 'warning',
  D: 'warning',
  F: 'error',
  'A+': 'success',
  A: 'success',
  'B+': 'info',
  B: 'info',
  'C+': 'warning',
  C: 'warning',
};

const FEEDBACK_MAX_LENGTH = 500;

const QUICK_TEMPLATES = [
  'Excellent Performance! Outstanding achievement in this examination.',
  'Outstanding work! Demonstrates exceptional understanding of the subject.',
  'Very Good performance. Shows strong command over the concepts.',
  'Good effort! Keep practicing to reach even higher.',
  'Satisfactory performance. Regular revision will help improve further.',
  'Needs Improvement. Please revisit the core concepts and practice regularly.',
  'Can Do Better. With focused preparation and consistent effort, improvement is expected.',
];

const AssignGrade: React.FC<IAssignGradeProps> = ({
  onClose,
  data,
  className,
  divisionName,
}: IAssignGradeProps) => {
  const attendanceLabelId = useId();
  const marksInputRef = useRef<HTMLInputElement>(null);
  const templateBtnRef = useRef<HTMLButtonElement>(null);
  const [activeQuickScore, setActiveQuickScore] = useState<string | null>(null);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { data: gradeScalingDetails } = useGetGradeScalingByIdQuery(
    {
      academicMediumId: medium?.id,
      id: data?.gradeScalingId,
    },
    {
      skip: !medium?.id || !data?.gradeScalingId,
    }
  );

  const targetScale = useMemo(() => {
    if (!gradeScalingDetails) return null;
    return (gradeScalingDetails as any).data ?? gradeScalingDetails;
  }, [gradeScalingDetails]);

  const [updateStudentMarks, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentMarksMutation,
  });

  const formik = useFormik({
    initialValues: {
      marks:
        typeof data?.marks === 'number'
          ? data.marks
          : typeof data?.obtainedMarks === 'number'
            ? data.obtainedMarks
            : '',
      totalMarks: typeof data?.totalMarks === 'number' ? data.totalMarks : '',
      feedback: data?.feedback || '',
      attendanceStatus:
        data?.attendanceStatus != null ? data.attendanceStatus : AttendanceStatus.Present,
    },
    validationSchema: Yup.object({
      marks: Yup.number()
        .typeError('Obtained Marks must be a number')
        .when('attendanceStatus', {
          is: (val: number) => val === AttendanceStatus.Present,
          then: (schema) =>
            schema
              .required('Obtained Marks is required')
              .min(0, 'Marks cannot be negative')
              .max(Yup.ref('totalMarks'), 'Obtained Marks cannot exceed Total Marks'),
          otherwise: (schema) => schema.nullable().optional(),
        }),
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
      const isPresent = values.attendanceStatus === AttendanceStatus.Present;

      try {
        await updateStudentMarks({
          examId,
          studentId,
          subjectId,
          body: {
            marks: isPresent ? Number(values.marks) : null,
            totalMarks: Number(values.totalMarks),
            feedback: isPresent ? values.feedback : undefined,
            attendanceStatus: values.attendanceStatus,
          },
        }).unwrap();

        onClose?.(null, true);
        shikshaMitraToast.success({
          message: isPresent
            ? isUpdate
              ? `Marks updated successfully for ${studentName}`
              : `Marks assigned successfully for ${studentName}`
            : `Attendance saved successfully for ${studentName}`,
        });
      } catch (error: any) {
        console.error('[AssignGrade] Failed to save:', error);
      }
    },
  });

  const totalMarks = Number(formik.values.totalMarks) || 0;
  const marksValue = Number(formik.values.marks);
  const autoGrade =
    formik.values.attendanceStatus === AttendanceStatus.Present &&
    formik.values.marks !== '' &&
    !Number.isNaN(marksValue)
      ? calculateAutoGrade(marksValue, totalMarks, targetScale)
      : null;
  const isAbsent = formik.values.attendanceStatus !== AttendanceStatus.Present;

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
              <Grid size={{ xs: 12 }}>
                <FormSectionCard
                  title="Student Context"
                  icon={GlobalIcons.assigned}
                  descriptionTooltip="Review the student identity and attendance before entering marks."
                >
                  <Grid container spacing={2}>
                    {/* Student Profile */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                        }}
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
                          <Stack spacing={0.25}>
                            <Typography variant="body2" lineHeight={1.3}>
                              {data?.studentName || '—'}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Roll no.: {data?.rollNo || '—'}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {[className, divisionName].filter(Boolean).join(' ') || '—'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Grid>

                    {/* Attendance */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel
                            id={attendanceLabelId}
                            aria-label={`Attendance for ${data?.studentName || 'student'}`}
                          >
                            Attendance
                          </InputLabel>
                          <Select
                            labelId={attendanceLabelId}
                            name="attendanceStatus"
                            label="Attendance"
                            SelectDisplayProps={{ 'aria-labelledby': attendanceLabelId }}
                            value={formik.values.attendanceStatus}
                            onChange={formik.handleChange}
                            renderValue={(selected) =>
                              AttendanceStatusLabel[selected as AttendanceStatus] ??
                              'Select attendance'
                            }
                          >
                            {AttendanceStatusOptions.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                <Label
                                  color={
                                    AttendanceStatusColor[opt.value as AttendanceStatus] as any
                                  }
                                >
                                  {opt.label}
                                </Label>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {isAbsent && (
                          <Alert severity="info" sx={{ mt: 1.5, py: 0.5 }}>
                            Marks entry is disabled for{' '}
                            <strong>
                              {
                                AttendanceStatusLabel[
                                  formik.values.attendanceStatus as AttendanceStatus
                                ]
                              }
                            </strong>{' '}
                            students.
                          </Alert>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </FormSectionCard>
              </Grid>

              {/* Marks Entry */}
              <Grid size={{ xs: 12 }}>
                <FormSectionCard
                  title="Marks Entry"
                  icon={GlobalIcons.notebook}
                  descriptionTooltip="Enter the student's obtained marks or use a quick score shortcut."
                >
                  <Box
                    sx={{
                      opacity: isAbsent ? 0.5 : 1,
                      pointerEvents: isAbsent ? 'none' : 'auto',
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Total marks"
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
                            label="Obtained marks"
                            required={!isAbsent}
                            fullWidth
                            type="number"
                            name="marks"
                            inputRef={marksInputRef}
                            placeholder={`0–${totalMarks}`}
                            size="small"
                            value={formik.values.marks}
                            inputProps={{
                              min: 0,
                              max: totalMarks,
                              'aria-label': `Obtained marks for ${data?.studentName || 'student'}`,
                            }}
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
                          Quick score
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
                </FormSectionCard>
              </Grid>

              {/* Feedback */}
              <Grid size={{ xs: 12 }}>
                <FormSectionCard
                  title="Feedback"
                  icon={GlobalIcons.edit}
                  descriptionTooltip="Add feedback for this student or choose an existing quick template."
                  action={
                    <Button
                      ref={templateBtnRef}
                      type="button"
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
                    >
                      Quick templates
                    </Button>
                  }
                >
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
                  <Box>
                    <ShakingTextField error={!!(formik.touched.feedback && formik.errors.feedback)}>
                      <TextField
                        label="Feedback"
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
                        inputProps={{
                          maxLength: FEEDBACK_MAX_LENGTH,
                          'aria-label': `Feedback for ${data?.studentName || 'student'}`,
                        }}
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
                </FormSectionCard>
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
