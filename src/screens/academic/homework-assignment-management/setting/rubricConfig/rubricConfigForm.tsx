'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { getIn, useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useRef, useState } from 'react';
import { alpha } from '@mui/material/styles';
import { varAlpha } from 'src/theme/styles';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  TextField,
  Typography,
  FormHelperText,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  RubricStatus,
  RubricVisibility,
  RubricScoringModel,
  useAddRubricMutation,
  usePublishRubricMutation,
  useUpdateRubricMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import {
  CRITERION_BANK,
  RUBRIC_WORK_TYPE_OPTIONS,
  DEFAULT_PERFORMANCE_LEVELS,
  RUBRIC_VISIBILITY_OPTIONS,
  RUBRIC_SCORING_MODEL_OPTIONS,
  RUBRIC_SCORING_MODEL_LABELS,
} from './constants';

import type {
  RubricConfigFormProps,
  RubricConfigFormValues,
  RubricCriterionFormValue,
  RubricPerformanceLevelFormValue,
} from './types';

const blankCriterion: RubricCriterionFormValue = {
  title: '',
  description: '',
  maxMarks: '',
  studentDescription: '',
  teacherGuidance: '',
  isRequired: true,
};

const builderSteps = ['Basic Information', 'Scoring Model', 'Criteria', 'Preview'];

const basicInformationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .max(256, 'Rubric name is too long')
    .required('Rubric name is required'),
  appliesToWorkType: Yup.number()
    .typeError('Applies to is required')
    .required('Applies to is required'),
  visibility: Yup.number().typeError('Visibility is required').required('Visibility is required'),
});

const scoringModelSchema = Yup.object({
  scoringModel: Yup.number().required('Scoring model is required'),
  performanceLevels: Yup.array()
    .of(
      Yup.object({
        level: Yup.number()
          .typeError('Level must be a number')
          .min(1, 'Level must be at least 1')
          .required('Level is required'),
        label: Yup.string().trim().required('Level label is required'),
        score: Yup.number()
          .typeError('Score must be a number')
          .min(0, 'Score cannot be negative')
          .required('Score is required'),
        studentLabel: Yup.string().trim().required('Student label is required'),
      })
    )
    .min(2, 'Add at least two performance levels'),
});

const criteriaSchema = Yup.object({
  criteria: Yup.array()
    .of(
      Yup.object({
        title: Yup.string().trim().required('Criterion title is required'),
        maxMarks: Yup.number()
          .typeError('Score must be a number')
          .min(0.5, 'Score must be at least 0.5')
          .required('Score is required'),
      })
    )
    .min(1, 'Add at least one criterion')
    .test('unique-criterion-title', 'Criterion names must be unique', (criteria) => {
      const names = (criteria || [])
        .map((criterion) => criterion.title?.trim().toLowerCase())
        .filter(Boolean);

      return names.length === new Set(names).size;
    })
    .test(
      'weighted-total',
      'Weighted percentage rubrics must total exactly 100%',
      function validateWeightedTotal(criteria) {
        if (this.parent.scoringModel !== RubricScoringModel.WeightedPercentage) return true;

        const total = (criteria || []).reduce(
          (sum, criterion) => sum + (Number(criterion.maxMarks) || 0),
          0
        );

        return total === 100;
      }
    ),
});

const fullValidationSchema = basicInformationSchema
  .concat(scoringModelSchema)
  .concat(criteriaSchema);
const stepValidationSchemas = [
  basicInformationSchema,
  scoringModelSchema,
  criteriaSchema,
  fullValidationSchema,
];

const normalizeLevels = (
  levels?: NonNullable<RubricConfigFormProps['editData']>['performanceLevels']
): RubricPerformanceLevelFormValue[] =>
  (levels?.length ? levels : DEFAULT_PERFORMANCE_LEVELS).map((level) => ({
    level: String(level.level),
    label: level.label,
    score: String(level.score),
    description: level.description || '',
    studentLabel: level.studentLabel || level.label,
  }));

const buildInitialValues = (
  editData: RubricConfigFormProps['editData']
): RubricConfigFormValues => ({
  title: editData?.title || '',
  description: editData?.description || '',
  appliesToWorkType:
    editData?.appliesToWorkType === null || editData?.appliesToWorkType === undefined
      ? ''
      : editData.appliesToWorkType,
  scoringModel: editData?.scoringModel ?? RubricScoringModel.PointsBased,
  visibility: editData?.visibility ?? RubricVisibility.Institution,
  evaluationInstructions: editData?.evaluationInstructions || '',
  studentInstructions: editData?.studentInstructions || '',
  tags: editData?.tags?.join(', ') || '',
  status: editData?.status ?? RubricStatus.Draft,
  performanceLevels: normalizeLevels(editData?.performanceLevels),
  criteria: editData?.criteria?.map((criterion) => ({
    title: criterion.title,
    description: criterion.description || '',
    maxMarks: String(criterion.maxMarks),
    studentDescription: '',
    teacherGuidance: '',
    isRequired: true,
  })) || [blankCriterion],
});

const getPublishErrors = (values: RubricConfigFormValues) => {
  const names = values.criteria
    .map((criterion) => criterion.title.trim().toLowerCase())
    .filter(Boolean);
  const duplicateNames = names.length !== new Set(names).size;
  const total = values.criteria.reduce(
    (sum, criterion) => sum + (Number(criterion.maxMarks) || 0),
    0
  );
  const errors: string[] = [];

  if (values.criteria.length === 0) errors.push('At least one criterion is required.');
  if (duplicateNames) errors.push('Criterion names must be unique.');
  if (values.scoringModel === RubricScoringModel.WeightedPercentage && total !== 100) {
    errors.push('Weighted percentage rubrics must total exactly 100%.');
  }
  if (
    values.scoringModel === RubricScoringModel.PerformanceLevels &&
    values.performanceLevels.filter((level) => level.label.trim()).length < 2
  ) {
    errors.push('Performance level rubrics require at least two levels.');
  }

  return errors;
};

const getFormikError = (formik: any, path: string) =>
  getIn(formik.touched, path) && getIn(formik.errors, path) ? getIn(formik.errors, path) : '';

const hasFormikError = (formik: any, path: string) => Boolean(getFormikError(formik, path));

const SectionPaper = ({
  title,
  caption,
  icon,
  children,
  action,
}: {
  title: string;
  caption?: string;
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 1.5, md: 2 },
      borderRadius: 1.5,
      bgcolor: 'background.paper',
      borderColor: 'divider',
      boxShadow: 'var(--shadows-2)',
    }}
  >
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            }}
          >
            <Iconify icon={icon} width={18} height={18} />
          </Box>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            {caption ? (
              <Typography variant="caption" color="text.secondary">
                {caption}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
        {action}
      </Stack>
      {children}
    </Stack>
  </Paper>
);

const RubricConfigForm: React.FC<RubricConfigFormProps> = ({ editData, onClose }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [activeStep, setActiveStep] = useState(0);
  const [submitMode, setSubmitMode] = useState<'draft' | 'publish'>('draft');
  const submitModeRef = useRef<'draft' | 'publish'>('draft');

  const [addRubric, { isLoading: isAddLoading }] = useAddRubricMutation();
  const [updateRubric, { isLoading: isUpdateLoading }] = useUpdateRubricMutation();
  const [publishRubric, { isLoading: isPublishLoading }] = usePublishRubricMutation();

  const rubricFormik = useFormik<RubricConfigFormValues>({
    enableReinitialize: true,
    initialValues: buildInitialValues(editData),
    validationSchema: stepValidationSchemas[activeStep],
    validateOnChange: false,
    onSubmit: () => { },
  });

  const submitRubric = async (
    mode: 'draft' | 'publish',
    values: RubricConfigFormValues,
    setIsLoading: (val: boolean) => void
  ) => {
    submitModeRef.current = mode;
    setSubmitMode(mode);
    setIsLoading(true);

    try {
      const publishErrors = getPublishErrors(values);
      if (mode === 'publish' && publishErrors.length > 0) {
        shikshaMitraToast.error({ message: publishErrors[0] });
        return;
      }

      const validCriteria = values.criteria
        .filter((criterion) => criterion.title.trim() && Number(criterion.maxMarks) > 0)
        .map((criterion, index) => ({
          title: criterion.title.trim(),
          description: criterion.description.trim() || null,
          maxMarks: Number(criterion.maxMarks),
          displayOrder: index + 1,
        }));

      const body = {
        standardId: null,
        subjectId: null,
        academicMediumId: currentMedium?.id || null,
        homeworkId: null,
        assignmentId: null,
        homeworkTypeId: null,
        assignmentTypeId: null,
        isTemplate: true,
        appliesToWorkType: Number(values.appliesToWorkType),
        scoringModel: values.scoringModel,
        visibility: values.visibility,
        title: values.title.trim(),
        description: values.description.trim() || null,
        evaluationInstructions: values.evaluationInstructions.trim() || null,
        studentInstructions: values.studentInstructions.trim() || null,
        tags: values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        performanceLevels: values.performanceLevels.map((level) => ({
          level: Number(level.level),
          label: level.label.trim(),
          score: Number(level.score),
          description: level.description.trim() || null,
          studentLabel: level.studentLabel.trim() || null,
        })),
        criteria: validCriteria,
      };

      const saved = editData
        ? await updateRubric({ id: editData.id, body }).unwrap()
        : await addRubric(body).unwrap();

      if (mode === 'publish' && saved.status !== RubricStatus.Published) {
        await publishRubric(saved.id).unwrap();
        shikshaMitraToast.success({ message: 'Rubric template published successfully.' });
        onClose(null, true);
      } else {
        shikshaMitraToast.success({
          message: editData
            ? 'Rubric template updated as draft.'
            : 'Rubric template saved as draft.',
        });
        if (mode === 'publish') {
          onClose(null, true);
        }
      }
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string; detail?: string } };
      shikshaMitraToast.error({
        message:
          apiError.data?.detail || apiError.data?.message || 'Failed to save rubric template.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSaving = isAddLoading || isUpdateLoading || isPublishLoading;

  const updateCriterion = (
    formik: any,
    index: number,
    field: keyof RubricCriterionFormValue,
    value: string | boolean
  ) => {
    formik.setFieldValue(`criteria[${index}].${field}`, value);
  };

  const updateLevel = (
    formik: any,
    index: number,
    field: keyof RubricPerformanceLevelFormValue,
    value: string
  ) => {
    formik.setFieldValue(`performanceLevels[${index}].${field}`, value);
  };

  const renderBasicInformation = (formik: any) => (
    <Stack spacing={1.5}>
      <SectionPaper
        icon="solar:document-text-bold-duotone"
        title="Template Identity"
        caption="Name the rubric and define where teachers can use it."
      >
        <Grid container spacing={1.25}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              name="title"
              label="Rubric Name *"
              value={formik.values.title}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={hasFormikError(formik, 'title')}
              helperText={
                getFormikError(formik, 'title') || ''
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <CustomSelect
              label="Applies To *"
              options={RUBRIC_WORK_TYPE_OPTIONS}
              labelKey="label"
              valueKey="value"
              value={formik.values.appliesToWorkType}
              onBlur={() => formik.setFieldTouched('appliesToWorkType', true)}
              onChange={(value) => formik.setFieldValue('appliesToWorkType', value)}
              error={hasFormikError(formik, 'appliesToWorkType')}
              helperText={getFormikError(formik, 'appliesToWorkType')}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <CustomSelect
              label="Visibility *"
              options={RUBRIC_VISIBILITY_OPTIONS}
              labelKey="label"
              valueKey="value"
              value={formik.values.visibility}
              onBlur={() => formik.setFieldTouched('visibility', true)}
              onChange={(value) => formik.setFieldValue('visibility', Number(value))}
              error={hasFormikError(formik, 'visibility')}
              helperText={getFormikError(formik, 'visibility')}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              name="description"
              label="Description"
              multiline
              rows={2}
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      </SectionPaper>

      <SectionPaper
        icon="solar:user-speak-bold-duotone"
        title="Guidance"
        caption="Optional instructions that appear with the rubric during evaluation."
      >
        <Grid container spacing={1.25}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              name="evaluationInstructions"
              label="Teacher Evaluation Instructions"
              multiline
              rows={3}
              value={formik.values.evaluationInstructions}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              name="studentInstructions"
              label="Student-Facing Instructions"
              multiline
              rows={3}
              value={formik.values.studentInstructions}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              name="tags"
              label="Tags"
              placeholder="project, creativity, grade 8"
              value={formik.values.tags}
              onChange={formik.handleChange}
              helperText="Separate tags with commas."
            />
          </Grid>
        </Grid>
      </SectionPaper>
    </Stack>
  );

  const renderScoringModel = (formik: any) => {
    const totalScore = formik.values.criteria.reduce(
      (sum: number, criterion: RubricCriterionFormValue) => sum + (Number(criterion.maxMarks) || 0),
      0
    );

    return (
      <Stack spacing={1.5}>
        <SectionPaper
          icon="solar:calculator-bold-duotone"
          title="Scoring Model"
          caption="Choose how the criteria score should be interpreted."
        >
          <Grid container spacing={1.25} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <CustomSelect
                label="Scoring Model *"
                options={RUBRIC_SCORING_MODEL_OPTIONS}
                labelKey="label"
                valueKey="value"
                value={formik.values.scoringModel}
                onChange={(value) => formik.setFieldValue('scoringModel', Number(value))}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Alert severity="info" sx={{ py: 0.5 }}>
                {formik.values.scoringModel === RubricScoringModel.WeightedPercentage
                  ? `Current total weight is ${totalScore}%. Publish is allowed only at 100%.`
                  : `Current maximum score is ${totalScore}. Criteria scores are configured in the next step.`}
              </Alert>
            </Grid>
          </Grid>
        </SectionPaper>

        <SectionPaper
          icon="solar:medal-ribbon-star-bold-duotone"
          title="Performance Levels"
          caption="Define labels teachers can use while evaluating the rubric."
          action={
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() =>
                formik.setFieldValue('performanceLevels', [
                  ...formik.values.performanceLevels,
                  { level: '', label: '', score: '', description: '', studentLabel: '' },
                ])
              }
            >
              Add Level
            </Button>
          }
        >
          {typeof getFormikError(formik, 'performanceLevels') === 'string' ? (
            <FormHelperText error>{getFormikError(formik, 'performanceLevels')}</FormHelperText>
          ) : null}
          <Stack spacing={1}>
            {formik.values.performanceLevels.map(
              (level: RubricPerformanceLevelFormValue, index: number) => (
                <Paper
                  key={`level-${index}`}
                  variant="outlined"
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    borderColor: 'divider',
                  }}
                >
                  <Grid container spacing={1} alignItems="center">
                    <Grid size={{ xs: 6, md: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Level"
                        name={`performanceLevels[${index}].level`}
                        value={level.level}
                        onBlur={formik.handleBlur}
                        onChange={(event) =>
                          updateLevel(formik, index, 'level', event.target.value)
                        }
                        error={hasFormikError(formik, `performanceLevels[${index}].level`)}
                        helperText={getFormikError(formik, `performanceLevels[${index}].level`)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Label"
                        name={`performanceLevels[${index}].label`}
                        value={level.label}
                        onBlur={formik.handleBlur}
                        onChange={(event) =>
                          updateLevel(formik, index, 'label', event.target.value)
                        }
                        error={hasFormikError(formik, `performanceLevels[${index}].label`)}
                        helperText={getFormikError(formik, `performanceLevels[${index}].label`)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Score"
                        type="number"
                        name={`performanceLevels[${index}].score`}
                        value={level.score}
                        onBlur={formik.handleBlur}
                        onChange={(event) =>
                          updateLevel(formik, index, 'score', event.target.value)
                        }
                        error={hasFormikError(formik, `performanceLevels[${index}].score`)}
                        helperText={getFormikError(formik, `performanceLevels[${index}].score`)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Student Label"
                        name={`performanceLevels[${index}].studentLabel`}
                        value={level.studentLabel}
                        onBlur={formik.handleBlur}
                        onChange={(event) =>
                          updateLevel(formik, index, 'studentLabel', event.target.value)
                        }
                        error={hasFormikError(formik, `performanceLevels[${index}].studentLabel`)}
                        helperText={getFormikError(
                          formik,
                          `performanceLevels[${index}].studentLabel`
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 10, md: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description"
                        value={level.description}
                        onChange={(event) =>
                          updateLevel(formik, index, 'description', event.target.value)
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 2, md: 1 }}>
                      <Button
                        size="small"
                        color="error"
                        disabled={formik.values.performanceLevels.length <= 2}
                        onClick={() =>
                          formik.setFieldValue(
                            'performanceLevels',
                            formik.values.performanceLevels.filter(
                              (_item: RubricPerformanceLevelFormValue, itemIndex: number) =>
                                itemIndex !== index
                            )
                          )
                        }
                      >
                        <Iconify icon={GlobalIcons.delete} />
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )
            )}
          </Stack>
        </SectionPaper>
      </Stack>
    );
  };

  const renderCriteria = (formik: any) => {
    const totalScore = formik.values.criteria.reduce(
      (sum: number, criterion: RubricCriterionFormValue) => sum + (Number(criterion.maxMarks) || 0),
      0
    );

    return (
      <Stack spacing={1.5}>
        <SectionPaper
          icon="solar:checklist-minimalistic-bold-duotone"
          title="Criteria Builder"
          caption="Add the rows teachers will score during evaluation."
          action={
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() =>
                formik.setFieldValue('criteria', [...formik.values.criteria, blankCriterion])
              }
            >
              Add Criterion
            </Button>
          }
        >
          <Stack spacing={1.25}>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {CRITERION_BANK.map((criterion) => (
                <Chip
                  key={criterion}
                  size="small"
                  label={criterion}
                  variant="outlined"
                  onClick={() =>
                    formik.setFieldValue('criteria', [
                      ...formik.values.criteria,
                      { ...blankCriterion, title: criterion },
                    ])
                  }
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Stack>
            {typeof getFormikError(formik, 'criteria') === 'string' ? (
              <FormHelperText error>{getFormikError(formik, 'criteria')}</FormHelperText>
            ) : null}
            {formik.values.criteria.map((criterion: RubricCriterionFormValue, index: number) => (
              <Paper
                key={`criterion-${index}`}
                variant="outlined"
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  borderColor: 'divider',
                }}
              >
                <Grid container spacing={1} alignItems="flex-start">
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Criterion *"
                      name={`criteria[${index}].title`}
                      value={criterion.title}
                      onBlur={formik.handleBlur}
                      onChange={(event) =>
                        updateCriterion(formik, index, 'title', event.target.value)
                      }
                      error={hasFormikError(formik, `criteria[${index}].title`)}
                      helperText={getFormikError(formik, `criteria[${index}].title`)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={criterion.description}
                      onChange={(event) =>
                        updateCriterion(formik, index, 'description', event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 8, md: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={
                        formik.values.scoringModel === RubricScoringModel.WeightedPercentage
                          ? 'Weight % *'
                          : 'Max Score *'
                      }
                      name={`criteria[${index}].maxMarks`}
                      value={criterion.maxMarks}
                      onBlur={formik.handleBlur}
                      onChange={(event) =>
                        updateCriterion(formik, index, 'maxMarks', event.target.value)
                      }
                      error={hasFormikError(formik, `criteria[${index}].maxMarks`)}
                      helperText={getFormikError(formik, `criteria[${index}].maxMarks`)}
                    />
                  </Grid>
                  <Grid size={{ xs: 4, md: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={criterion.isRequired}
                          onChange={(event) =>
                            updateCriterion(formik, index, 'isRequired', event.target.checked)
                          }
                        />
                      }
                      label="Required"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 1 }}>
                    <Button
                      size="small"
                      color="error"
                      disabled={formik.values.criteria.length === 1}
                      onClick={() =>
                        formik.setFieldValue(
                          'criteria',
                          formik.values.criteria.filter(
                            (_item: RubricCriterionFormValue, itemIndex: number) =>
                              itemIndex !== index
                          )
                        )
                      }
                    >
                      <Iconify icon={GlobalIcons.delete} />
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Student-Facing Description"
                      value={criterion.studentDescription}
                      onChange={(event) =>
                        updateCriterion(formik, index, 'studentDescription', event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Teacher Guidance"
                      value={criterion.teacherGuidance}
                      onChange={(event) =>
                        updateCriterion(formik, index, 'teacherGuidance', event.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </SectionPaper>
        <Alert
          severity={
            formik.values.scoringModel === RubricScoringModel.WeightedPercentage &&
              totalScore !== 100
              ? 'warning'
              : 'info'
          }
        >
          {formik.values.scoringModel === RubricScoringModel.WeightedPercentage
            ? `Total weight: ${totalScore}%. Keep it exactly 100% before publishing.`
            : `Maximum score: ${totalScore}.`}
        </Alert>
      </Stack>
    );
  };

  const renderPreview = (formik: any) => {
    const totalScore = formik.values.criteria.reduce(
      (sum: number, criterion: RubricCriterionFormValue) => sum + (Number(criterion.maxMarks) || 0),
      0
    );
    const publishErrors = getPublishErrors(formik.values);

    return (
      <Stack spacing={1.5}>
        <SectionPaper
          icon="solar:clipboard-check-bold-duotone"
          title="Review & Publish"
          caption="Confirm the scoring setup before making this template available."
        >
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              variant="outlined"
              label={`Model: ${RUBRIC_SCORING_MODEL_LABELS[formik.values.scoringModel as RubricScoringModel]
                }`}
              size='small'
            />
            <Chip variant="outlined" size='small'
              label={`Criteria: ${formik.values.criteria.length}`} />
            <Chip variant="outlined" size='small'
              label={`Maximum Score: ${totalScore}`} />
            <Chip
              size='small'
              color={publishErrors.length ? 'warning' : 'success'}
              label={publishErrors.length ? 'Needs Review' : 'Ready to Publish'}
            />
          </Stack>
        </SectionPaper>
        {publishErrors.length ? (
          <Alert severity="warning">
            <Stack component="ul" sx={{ pl: 2, m: 0 }}>
              {publishErrors.map((error) => (
                <Typography component="li" variant="body2" key={error}>
                  {error}
                </Typography>
              ))}
            </Stack>
          </Alert>
        ) : (
          <Alert severity="success">All blocking validation checks are complete.</Alert>
        )}
        <SectionPaper
          icon="solar:eye-bold-duotone"
          title="Teacher Evaluation Preview"
          caption="This is the criteria view teachers will work from."
        >
          <Stack spacing={1}>
            {formik.values.criteria.map((criterion: RubricCriterionFormValue, index: number) => (
              <Box
                key={`preview-${index}`}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.neutral',
                }}
              >
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {criterion.title || `Criterion ${index + 1}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {criterion.maxMarks || 0} pts
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {criterion.studentDescription ||
                    criterion.description ||
                    'No student-facing description added.'}
                </Typography>
              </Box>
            ))}
          </Stack>
        </SectionPaper>
      </Stack>
    );
  };


  return (
    <CustomStepperWithFormik
      initialValues={rubricFormik.initialValues}
      formikInstance={rubricFormik}
      steps={builderSteps}
      activeStep={activeStep}
      validateOnChange={false}
      validationSchema={stepValidationSchemas[activeStep]}
      showSaveButton={activeStep === builderSteps.length - 1}
      nextButtonLabel="Next"
      finalButtonLabel="Publish Rubric"
      saveButtonProps={{
        loading: isSaving && submitMode === 'draft',
        disabled: isSaving,
        startIcon: <Iconify icon="solar:diskette-bold" />,
        children: 'Save Draft',
      }}
      saveAndNextButtonProps={{
        loading: isSaving && submitMode === 'publish',
        disabled: isSaving,
        startIcon:
          activeStep === builderSteps.length - 1 ? <Iconify icon="solar:upload-bold" /> : null,
      }}
      handleBack={() => setActiveStep((step) => Math.max(step - 1, 0))}
      handleNext={(isLastStep, values, _formik, setIsLoading) => {
        if (!isLastStep) {
          setActiveStep((step) => Math.min(step + 1, builderSteps.length - 1));
          return;
        }

        submitRubric('publish', values, setIsLoading);
      }}
      onSave={(_isLastStep, values, _formik, setIsLoading) =>
        submitRubric('draft', values, setIsLoading)
      }
      renderItem={({ formik, activeStep: step }) => (
        <Box>

          {/* Step content */}
          <Box sx={{ p: { xs: 1.5, md: 2 } }}>
            {step === 0 ? renderBasicInformation(formik) : null}
            {step === 1 ? renderScoringModel(formik) : null}
            {step === 2 ? renderCriteria(formik) : null}
            {step === 3 ? renderPreview(formik) : null}
          </Box>
        </Box>
      )}
    />
  );
};

export default RubricConfigForm;
