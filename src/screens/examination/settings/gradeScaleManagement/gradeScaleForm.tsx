import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import {
  Box,
  Grid,
  Alert,
  Button,
  Switch,
  Divider,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useAddGradeScalingMutation,
  useUpdateGradeScalingMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';

import { getInitialValues } from './initialValues';
import { stepValidationSchemas } from './validationSchema';

import type { IGrade, IGradingScale, IGradeFormProps } from './type';

const STATUS_OPTIONS = [
  { value: 0, label: 'Active' },
  { value: 2, label: 'System Default' },
  { value: 3, label: 'Archived' },
];

const RESULT_STATUS_OPTIONS = [
  { value: 0, label: 'Pass' },
  { value: 1, label: 'Fail' },
  { value: 2, label: 'Optional' },
];

// Permissive schema for view-only mode — never blocks step navigation.
const VIEW_ONLY_SCHEMA = Yup.object().shape({});

const GRADE_SCALE_STEPS = ['Basic Details', 'Grade Ranges', 'Simulator'];

// Predefined templates for grade scaling
const TEMPLATES = [
  {
    name: '100 Marks Standard (A+ to F)',
    totalMarks: 100,
    passMarks: 33,
    gradingScale: [
      {
        minMarks: 91,
        maxMarks: 100,
        grade: 'A+',
        gradePoint: 10,
        remark: 'Excellent',
        resultStatus: 0,
      },
      {
        minMarks: 81,
        maxMarks: 90,
        grade: 'A',
        gradePoint: 9,
        remark: 'Very Good',
        resultStatus: 0,
      },
      { minMarks: 71, maxMarks: 80, grade: 'B+', gradePoint: 8, remark: 'Good', resultStatus: 0 },
      {
        minMarks: 61,
        maxMarks: 70,
        grade: 'B',
        gradePoint: 7,
        remark: 'Satisfactory',
        resultStatus: 0,
      },
      { minMarks: 51, maxMarks: 60, grade: 'C+', gradePoint: 6, remark: 'Fair', resultStatus: 0 },
      { minMarks: 41, maxMarks: 50, grade: 'C', gradePoint: 5, remark: 'Average', resultStatus: 0 },
      {
        minMarks: 33,
        maxMarks: 40,
        grade: 'D',
        gradePoint: 4,
        remark: 'Needs Improvement',
        resultStatus: 0,
      },
      { minMarks: 0, maxMarks: 32, grade: 'F', gradePoint: 0, remark: 'Fail', resultStatus: 1 },
    ],
  },
  {
    name: '50 Marks Scale',
    totalMarks: 50,
    passMarks: 17,
    gradingScale: [
      {
        minMarks: 46,
        maxMarks: 50,
        grade: 'A+',
        gradePoint: 10,
        remark: 'Excellent',
        resultStatus: 0,
      },
      {
        minMarks: 41,
        maxMarks: 45,
        grade: 'A',
        gradePoint: 9,
        remark: 'Very Good',
        resultStatus: 0,
      },
      { minMarks: 36, maxMarks: 40, grade: 'B+', gradePoint: 8, remark: 'Good', resultStatus: 0 },
      {
        minMarks: 31,
        maxMarks: 35,
        grade: 'B',
        gradePoint: 7,
        remark: 'Satisfactory',
        resultStatus: 0,
      },
      { minMarks: 26, maxMarks: 30, grade: 'C+', gradePoint: 6, remark: 'Fair', resultStatus: 0 },
      { minMarks: 21, maxMarks: 25, grade: 'C', gradePoint: 5, remark: 'Average', resultStatus: 0 },
      {
        minMarks: 17,
        maxMarks: 20,
        grade: 'D',
        gradePoint: 4,
        remark: 'Needs Improvement',
        resultStatus: 0,
      },
      { minMarks: 0, maxMarks: 16, grade: 'F', gradePoint: 0, remark: 'Fail', resultStatus: 1 },
    ],
  },
  {
    name: 'Pass / Fail Scale',
    totalMarks: 100,
    passMarks: 33,
    gradingScale: [
      {
        minMarks: 33,
        maxMarks: 100,
        grade: 'Pass',
        gradePoint: 10,
        remark: 'Passed',
        resultStatus: 0,
      },
      {
        minMarks: 0,
        maxMarks: 32,
        grade: 'Fail',
        gradePoint: 0,
        remark: 'Failed',
        resultStatus: 1,
      },
    ],
  },
];

const GradeForm: React.FC<IGradeFormProps> = ({ onClose, data, viewOnly = false }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [activeStep, setActiveStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(
    data || viewOnly ? GRADE_SCALE_STEPS.length - 1 : 0
  );
  const [simMarks, setSimMarks] = useState<string>('');

  const [addGradeScaling, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddGradeScalingMutation,
  });
  const [updateGradeScaling, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateGradeScalingMutation,
  });

  const activeSchema = viewOnly ? VIEW_ONLY_SCHEMA : stepValidationSchemas[activeStep];

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(data),
    validationSchema: activeSchema,
    validateOnChange: false,
    onSubmit: () => {},
  });
  const { submitCount, values: formValues, validateField } = formik;

  useEffect(() => {
    const hasStartedGradeRanges =
      activeStep === 1 &&
      (submitCount > 0 || formValues.gradingScale.length > 0);
    if (hasStartedGradeRanges) {
      validateField('gradingScale');
    }
  }, [activeStep, submitCount, formValues.gradingScale, validateField]);

  // -------------------------------------------------------------------------
  // Submit — preserves the existing payload/API logic exactly.
  // -------------------------------------------------------------------------
  const submitGradeScale = async (values: any, setIsLoading: (val: boolean) => void) => {
    setIsLoading(true);
    try {
      const payloadBody = {
        name: values.name,
        totalMarks: String(values.totalMarks),
        passMarks: values.passMarks !== '' ? Number(values.passMarks) : null,
        description: values.description,
        isDefault: values.isDefault,
        status: values.status,
        gradingScale: values.gradingScale.map((range: any) => ({
          minMarks: Number(range.minMarks),
          maxMarks: Number(range.maxMarks),
          grade: range.grade,
          gradePoint: range.gradePoint !== '' ? Number(range.gradePoint) : null,
          remark: range.remark,
          resultStatus: Number(range.resultStatus),
        })),
        educationMediumId: (currentMedium as Medium).id,
      };

      if (data) {
        const payload = {
          academicMediumId: (currentMedium as Medium).id,
          id: (data as IGrade).id,
          body: payloadBody,
        };
        await updateGradeScaling(payload).unwrap();
        shikshaMitraToast.success({
          message: `Grade scale: "${values.name}" updated successfully`,
        });
        onClose(null, true);
      } else {
        const payload = {
          academicMediumId: (currentMedium as Medium).id,
          body: payloadBody,
        };
        await addGradeScaling(payload).unwrap();
        shikshaMitraToast.success({
          message: `Grade scale: "${values.name}" added successfully`,
        });
        onClose(null, true);
      }
    } catch (error) {
      console.error('Failed to save subject', error);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Stepper navigation
  // -------------------------------------------------------------------------
  const handleBack = () => setActiveStep((step) => Math.max(step - 1, 0));

  const handleNext = (
    isLastStep: boolean,
    values: any,
    _formik: any,
    setIsLoading: (val: boolean) => void
  ) => {
    // Read-only mode: navigate freely, close on the final step. No validation,
    // no API call.
    if (viewOnly) {
      if (isLastStep) {
        onClose(null, false);
        return;
      }
      setActiveStep((step) => Math.min(step + 1, GRADE_SCALE_STEPS.length - 1));
      return;
    }

    if (!isLastStep) {
      setActiveStep((step) => {
        const nextStep = Math.min(step + 1, GRADE_SCALE_STEPS.length - 1);
        setMaxReachedStep((reachedStep) => Math.max(reachedStep, nextStep));
        return nextStep;
      });
      return;
    }

    submitGradeScale(values, setIsLoading);
  };

  const handleAddGradingScale = () => {
    const updatedGradingScale = [
      ...formik.values.gradingScale,
      { minMarks: '', maxMarks: '', grade: '', gradePoint: '', remark: '', resultStatus: 0 },
    ];
    formik.setFieldValue('gradingScale', updatedGradingScale);
    formik.setFieldError('gradingScale', undefined);
  };

  const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
    formik.setFieldValue('totalMarks', template.totalMarks);
    formik.setFieldValue('passMarks', template.passMarks);
    formik.setFieldValue('gradingScale', template.gradingScale);
    formik.setFieldError('gradingScale', undefined);
    shikshaMitraToast.info({ message: `Prefilled template: "${template.name}"` });
  };

  // Simulator computation logic
  const marksInput = Number(simMarks);
  const matchedRange =
    simMarks !== '' && !Number.isNaN(marksInput)
      ? formik.values.gradingScale.find(
          (r: any) =>
            r.minMarks !== '' &&
            r.maxMarks !== '' &&
            marksInput >= Number(r.minMarks) &&
            marksInput <= Number(r.maxMarks)
        )
      : null;

  // -------------------------------------------------------------------------
  // Step renderers
  // -------------------------------------------------------------------------
  const renderBasicDetails = () => (
    <Grid container spacing={1.5}>
      {/* Template Section */}
      {!data && !viewOnly && (
        <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
          <Box
            p={2}
            border="1px dashed"
            borderColor="primary.main"
            borderRadius={1}
            bgcolor="background.neutral"
          >
            <Typography variant="subtitle2" gutterBottom color="primary.main">
              Quick Start Templates
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {TEMPLATES.map((t, idx) => (
                <Button key={idx} size="small" variant="outlined" onClick={() => applyTemplate(t)}>
                  {t.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            label="Grade Scale Title *"
            name="name"
            size="small"
            disabled={!!data || viewOnly}
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name ? (formik.errors.name as string) : ''}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.totalMarks && formik.errors.totalMarks)}>
          <TextField
            fullWidth
            label="Total Marks *"
            name="totalMarks"
            type="number"
            disabled={!!data || viewOnly}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                e.preventDefault();
            }}
            size="small"
            value={formik.values.totalMarks}
            onChange={formik.handleChange}
            onWheel={(e) => (e.target as HTMLElement).blur()}
            error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
            helperText={formik.touched.totalMarks ? (formik.errors.totalMarks as string) : ''}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.passMarks && formik.errors.passMarks)}>
          <TextField
            fullWidth
            label="Pass Marks"
            name="passMarks"
            type="number"
            disabled={viewOnly}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                e.preventDefault();
            }}
            size="small"
            value={formik.values.passMarks}
            onChange={formik.handleChange}
            onWheel={(e) => (e.target as HTMLElement).blur()}
            error={formik.touched.passMarks && Boolean(formik.errors.passMarks)}
            helperText={formik.touched.passMarks ? (formik.errors.passMarks as string) : ''}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            disabled={viewOnly}
            size="small"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description ? (formik.errors.description as string) : ''}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <CustomSelect
          fullWidth
          label="Status *"
          options={STATUS_OPTIONS}
          name="status"
          size="small"
          disabled={viewOnly}
          value={formik.values.status}
          onChange={(val) => formik.setFieldValue('status', val)}
          error={formik.touched.status && Boolean(formik.errors.status)}
          helperText={formik.touched.status ? (formik.errors.status as string) : ''}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FormControlLabel
          control={
            <Switch
              name="isDefault"
              disabled={viewOnly}
              checked={formik.values.isDefault}
              onChange={(e) => formik.setFieldValue('isDefault', e.target.checked)}
            />
          }
          label="Set as Default Scale"
        />
      </Grid>

      {data && (data as any).usageCount > 0 && !viewOnly && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning">
            This grade scale is already used in academic modules. Major changes may affect existing
            records.
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  const renderGradeRanges = () => (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Configured Grade Ranges</Typography>
        {!viewOnly && (
          <Button
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={handleAddGradingScale}
          >
            Add Row
          </Button>
        )}
      </Box>
      {typeof formik.errors.gradingScale === 'string' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formik.errors.gradingScale}
        </Alert>
      )}

      <Box sx={{ overflowX: 'auto', pt: 1.5, pb: 2 }}>
        {formik.values.gradingScale?.map((scale: IGradingScale, index: number) => {
          const touchedRange = (
            formik.touched.gradingScale as FormikTouched<IGradingScale>[] | undefined
          )?.[index];
          const errorRange = Array.isArray(formik.errors.gradingScale)
            ? (formik.errors.gradingScale[index] as FormikErrors<IGradingScale> | undefined)
            : undefined;
          const visibleErrors = [
            ['Min Marks', 'minMarks'],
            ['Max Marks', 'maxMarks'],
            ['Grade', 'grade'],
            ['Point', 'gradePoint'],
            ['Remark', 'remark'],
          ].flatMap(([label, field]) => {
            const fieldName = field as keyof IGradingScale;
            const message = errorRange?.[fieldName];
            return touchedRange?.[fieldName] && typeof message === 'string'
              ? [`${label}: ${message}`]
              : [];
          });

          return (
            <Grid
              container
              spacing={1.5}
              key={index}
              mb={2.5}
              alignItems="center"
              sx={{
                minWidth: { md: '100%' },
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 2,
              }}
            >
              <Grid size={{ xs: 12, md: 1.9 }}>
                <ShakingTextField
                  error={
                    !!(
                      (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                        ?.minMarks &&
                      (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                        ?.minMarks
                    )
                  }
                >
                  <TextField
                    fullWidth
                    label="Min Marks *"
                    type="number"
                    name={`gradingScale.${index}.minMarks`}
                    size="small"
                    disabled={viewOnly}
                    value={formik.values.gradingScale[index].minMarks}
                    onChange={formik.handleChange}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                        e.preventDefault();
                    }}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    error={
                      !!(
                        (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                          ?.minMarks &&
                        (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                          ?.minMarks
                      )
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.9 }}>
                <ShakingTextField
                  error={
                    !!(
                      (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                        ?.maxMarks &&
                      (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                        ?.maxMarks
                    )
                  }
                >
                  <TextField
                    fullWidth
                    label="Max Marks *"
                    type="number"
                    name={`gradingScale.${index}.maxMarks`}
                    size="small"
                    disabled={viewOnly}
                    value={formik.values.gradingScale[index].maxMarks}
                    onChange={formik.handleChange}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                        e.preventDefault();
                    }}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    error={
                      !!(
                        (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                          ?.maxMarks &&
                        (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                          ?.maxMarks
                      )
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.9 }}>
                <ShakingTextField
                  error={
                    !!(
                      (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                        ?.grade &&
                      (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]?.grade
                    )
                  }
                >
                  <TextField
                    fullWidth
                    label="Grade *"
                    name={`gradingScale.${index}.grade`}
                    size="small"
                    disabled={viewOnly}
                    value={formik.values.gradingScale[index].grade}
                    onChange={formik.handleChange}
                    error={
                      !!(
                        (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                          ?.grade &&
                        (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                          ?.grade
                      )
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.4 }}>
                <ShakingTextField
                  error={
                    !!(
                      (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                        ?.gradePoint &&
                      (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                        ?.gradePoint
                    )
                  }
                >
                  <TextField
                    fullWidth
                    label="Point"
                    type="number"
                    name={`gradingScale.${index}.gradePoint`}
                    size="small"
                    disabled={viewOnly}
                    value={formik.values.gradingScale[index].gradePoint}
                    onChange={formik.handleChange}
                    error={
                      !!(
                        (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                          ?.gradePoint &&
                        (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                          ?.gradePoint
                      )
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 2.4 }}>
                <ShakingTextField
                  error={
                    !!(
                      (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                        ?.remark &&
                      (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]?.remark
                    )
                  }
                >
                  <TextField
                    fullWidth
                    label="Remark"
                    name={`gradingScale.${index}.remark`}
                    size="small"
                    disabled={viewOnly}
                    value={formik.values.gradingScale[index].remark}
                    onChange={formik.handleChange}
                    error={
                      !!(
                        (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                          ?.remark &&
                        (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                          ?.remark
                      )
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.8 }}>
                <CustomSelect
                  fullWidth
                  label="Result"
                  options={RESULT_STATUS_OPTIONS}
                  name={`gradingScale.${index}.resultStatus`}
                  size="small"
                  disabled={viewOnly}
                  value={formik.values.gradingScale[index].resultStatus}
                  onChange={(val) =>
                    formik.setFieldValue(`gradingScale.${index}.resultStatus`, val)
                  }
                />
              </Grid>

              {!viewOnly && (
                <Grid size={{ xs: 12, md: 0.7 }}>
                  <IconButton
                    onClick={() => {
                      const updatedGradingScale = [...formik.values.gradingScale];
                      updatedGradingScale.splice(index, 1);
                      formik.setFieldValue('gradingScale', updatedGradingScale);
                    }}
                    sx={{ color: 'error.main', width: '30px', height: '30px' }}
                  >
                    <Iconify icon={GlobalIcons.delete} sx={{ width: '18px', height: '18px' }} />
                  </IconButton>
                </Grid>
              )}
              {visibleErrors.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="error" role="alert" sx={{ py: 0.25 }}>
                    {visibleErrors.join(' · ')}
                  </Alert>
                </Grid>
              )}
            </Grid>
          );
        })}
      </Box>
    </Box>
  );

  const renderSimulator = () => (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <Typography variant="subtitle1">Grade Scaling Simulator</Typography>
          <CustomTooltip
            arrow
            placement="right"
            title="Verify your grade scaling by entering sample student marks to see how the system calculates grades."
          >
            <IconButton size="small" aria-label="About grade scaling simulator">
              <Iconify icon="lucide:info" sx={{ width: 18, height: 18, color: 'info.main' }} />
            </IconButton>
          </CustomTooltip>
        </Box>
        <TextField
          fullWidth
          label="Sample Obtained Marks"
          type="number"
          placeholder="Enter obtained marks..."
          value={simMarks}
          onChange={(e) => setSimMarks(e.target.value)}
          size="small"
          sx={{ mb: 3 }}
        />
        <Divider sx={{ mb: 3 }} />

        {matchedRange ? (
          <TimetableSettingsSummaryCards
            cards={[
              {
                label: 'Calculated Grade',
                value: matchedRange.grade,
                icon: 'solar:target-bold-duotone',
                color: 'primary',
              },
              {
                label: 'Grade Point',
                value: matchedRange.gradePoint !== '' ? matchedRange.gradePoint : '-',
                icon: 'solar:star-fall-bold-duotone',
                color: 'info',
              },
              {
                label: 'Result Status',
                value:
                  matchedRange.resultStatus === 0
                    ? 'Pass'
                    : matchedRange.resultStatus === 1
                      ? 'Fail'
                      : 'Optional',
                icon: 'solar:check-circle-bold-duotone',
                color:
                  matchedRange.resultStatus === 0
                    ? 'success'
                    : matchedRange.resultStatus === 1
                      ? 'error'
                      : 'warning',
              },
              {
                label: 'Remark',
                value: matchedRange.remark || '-',
                icon: 'solar:chat-round-dots-bold-duotone',
                color: 'warning',
              },
            ]}
          />
        ) : (
          <Box
            p={4}
            minHeight={180}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1}
            bgcolor="background.neutral"
            border="1px dashed"
            borderColor="divider"
            borderRadius={1}
            textAlign="center"
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'background.paper',
                color: 'text.secondary',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Iconify icon="mdi:calculator-variant-outline" width={26} />
            </Box>
            <Typography variant="subtitle2" color="text.primary">
              Simulator result will appear here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {simMarks === ''
                ? 'Enter sample marks above to test the calculator.'
                : `No grade range defined for ${simMarks} marks.`}
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <CustomStepperWithFormik
        scrollbarHeight={activeStep === 1 ? 'min(400px, calc(100dvh - 280px))' : 'auto'}
        initialValues={formik.initialValues}
        formikInstance={formik}
        steps={GRADE_SCALE_STEPS}
        activeStep={activeStep}
        validateOnChange={false}
        validationSchema={activeSchema}
        showSaveButton={false}
        nextButtonLabel={viewOnly ? 'Next' : 'Save & Next'}
        finalButtonLabel={viewOnly ? 'Close' : data ? 'Update' : 'Submit'}
        saveAndNextButtonProps={{
          loading: isAddLoading || isUpdateLoading,
        }}
        completedSteps={Array.from({ length: maxReachedStep }, (_, index) => index).filter(
          (index) => index !== activeStep
        )}
        isStepClickable={(stepIndex) => stepIndex <= maxReachedStep}
        onStepClick={(stepIndex) => {
          if (stepIndex !== activeStep && stepIndex <= maxReachedStep) {
            setActiveStep(stepIndex);
          }
        }}
        handleBack={handleBack}
        handleNext={handleNext}
        renderItem={({ activeStep: step }) => (
          <Box
            sx={{
              px: { xs: 1.5, md: 2 },
              pt: { xs: 2, md: 2.5 },
              pb: { xs: 1.5, md: 2 },
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {step === 0 && renderBasicDetails()}
            {step === 1 && renderGradeRanges()}
            {step === 2 && renderSimulator()}
          </Box>
        )}
      />
    </BackPopUpChecked>
  );
};
export default GradeForm;
