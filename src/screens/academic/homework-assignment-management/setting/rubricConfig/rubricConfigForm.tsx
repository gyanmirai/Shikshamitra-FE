'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Typography,
} from '@mui/material';
import {
  RubricStatus,
  RubricVisibility,
  RubricScoringModel,
  useAddRubricMutation,
  useUpdateRubricMutation,
  usePublishRubricMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { levelNumberAt } from './performance-level-order';
import { RubricBasicInformation } from './components/RubricBasicInformation';
import { RubricCriteriaBuilder } from './components/RubricCriteriaBuilder';
import { RubricPerformanceLevels } from './components/RubricPerformanceLevels';
import { RubricTemplatePreview } from './components/RubricTemplatePreview';
import { parseRubricTags } from './components/RubricTagsField';
import { RubricFormSection as SectionPaper } from './components/RubricFormSection';
import {
  DEFAULT_RATING_LEVELS,
  DEFAULT_PERFORMANCE_LEVELS,
  RUBRIC_SCORING_MODEL_LABELS,
  RUBRIC_SCORING_MODEL_OPTIONS,
} from './constants';

import type {
  RubricConfigFormProps,
  RubricConfigFormValues,
  RubricCriterionFormValue,
  RubricPerformanceLevelFormValue,
} from './types';

const blankCriterion: RubricCriterionFormValue = {
  id: 'new-criterion-initial',
  title: '',
  description: '',
  maxMarks: '10',
  studentDescription: '',
  teacherGuidance: '',
  isRequired: true,
};

const builderSteps = ['Basic Information', 'Criteria & Scoring', 'Preview'];

const basicInformationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .max(256, 'Rubric name is too long')
    .required('Rubric name is required'),
  appliesToWorkType: Yup.number()
    .typeError('Applies to is required')
    .required('Applies to is required'),
});

const scoringModelSchema = Yup.object({
  scoringModel: Yup.number().required('Scoring model is required'),
  performanceLevels: Yup.array()
    .of(
      Yup.object({
        label: Yup.string().trim().required('Level label is required'),
        score: Yup.number()
          .typeError('Score must be a number')
          .min(0, 'Score cannot be negative')
          .max(1000, 'Score cannot exceed 1000')
          .required('Score is required'),
        studentLabel: Yup.string().trim().required('Student label is required'),
      })
    )
    .test('model-levels', function validateLevels(levels) {
      const model = this.parent.scoringModel;
      if (model !== RubricScoringModel.PerformanceLevels && model !== RubricScoringModel.RatingScale) return true;
      if (!levels || levels.length < 2) return this.createError({ message: 'Add at least two levels' });
      const scores = levels.map((level) => Number(level.score));
      if (new Set(scores).size !== scores.length) return this.createError({ message: 'Each level needs a different score' });
      if (model === RubricScoringModel.RatingScale && scores.some((score) => !Number.isInteger(score) || score < 1 || score > 10)) {
        return this.createError({ message: 'Ratings must be whole numbers from 1 to 10' });
      }
      return true;
    }),
});

const criteriaSchema = Yup.object({
  criteria: Yup.array()
    .of(
      Yup.object({
        title: Yup.string().trim().required('Criterion title is required'),
        maxMarks: Yup.number()
          .typeError('Score must be a number')
          .moreThan(0, 'Score must be greater than zero')
          .max(1000, 'Score cannot exceed 1000')
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

        return Math.abs(total - 100) < 0.001;
      }
    )
    .test('model-criteria', function validateModelCriteria(criteria) {
      const model = this.parent.scoringModel;
      if (!criteria) return true;
      const maxScores = criteria.map((criterion) => Number(criterion.maxMarks));
      if (model === RubricScoringModel.PointsBased && maxScores.some((score) => score < 0.5)) {
        return this.createError({ message: 'Points-based criteria need at least 0.5 points' });
      }
      if (model === RubricScoringModel.WeightedPercentage && maxScores.some((score) => score > 100)) {
        return this.createError({ message: 'Each weight must be 100% or less' });
      }
      if (model === RubricScoringModel.Checklist && !this.parent.performanceLevels?.length && maxScores.some((score) => score !== 1)) {
        return this.createError({ message: 'Checklist items must be worth one point' });
      }
      if (model === RubricScoringModel.PerformanceLevels || model === RubricScoringModel.RatingScale) {
        const levels = this.parent.performanceLevels as RubricPerformanceLevelFormValue[];
        const scores = levels.map((level) => Number(level.score));
        if (maxScores.some((score) => !scores.includes(score))) {
          return this.createError({ message: 'Choose a maximum from the configured levels' });
        }
      }
      if (model !== RubricScoringModel.WeightedPercentage && maxScores.reduce((sum, score) => sum + score, 0) > 1000) {
        return this.createError({ message: 'Total rubric score cannot exceed 1000' });
      }
      return true;
    }),
});

const fullValidationSchema = basicInformationSchema
  .concat(scoringModelSchema)
  .concat(criteriaSchema);
const criteriaAndScoringSchema = scoringModelSchema.concat(criteriaSchema);
const stepValidationSchemas = [
  basicInformationSchema,
  criteriaAndScoringSchema,
  fullValidationSchema,
];

const normalizeLevels = (
  levels: NonNullable<RubricConfigFormProps['editData']>['performanceLevels'] | typeof DEFAULT_PERFORMANCE_LEVELS
): RubricPerformanceLevelFormValue[] =>
  [...levels]
    .sort((first, second) => second.level - first.level)
    .map((level, index) => ({
      id: `level-${index}`,
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
  evaluationInstructions: editData?.evaluationInstructions || '',
  studentInstructions: editData?.studentInstructions || '',
  tags: editData?.tags?.join(', ') || '',
  status: editData?.status ?? RubricStatus.Draft,
  performanceLevels: editData?.performanceLevels?.length
    ? normalizeLevels(editData.performanceLevels)
    : editData?.scoringModel === RubricScoringModel.RatingScale
      ? normalizeLevels(DEFAULT_RATING_LEVELS)
      : editData?.scoringModel === RubricScoringModel.PerformanceLevels
        ? normalizeLevels(DEFAULT_PERFORMANCE_LEVELS)
        : [],
  criteria: editData?.criteria?.length
    ? [...editData.criteria]
        .sort((first, second) => first.displayOrder - second.displayOrder)
        .map((criterion) => ({
          id: `criterion-${criterion.id}`,
          title: criterion.title,
          description: criterion.description || '',
          maxMarks: String(criterion.maxMarks),
          studentDescription: criterion.studentDescription || '',
          teacherGuidance: criterion.teacherGuidance || '',
          isRequired: criterion.isRequired,
        }))
    : [blankCriterion],
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
  if (values.criteria.some((criterion) => Number(criterion.maxMarks) > 1000)) {
    errors.push('A criterion cannot exceed 1000 points.');
  }
  if (values.scoringModel === RubricScoringModel.WeightedPercentage && Math.abs(total - 100) >= 0.001) {
    errors.push('Weighted percentage rubrics must total exactly 100%.');
  }
  if (values.scoringModel !== RubricScoringModel.WeightedPercentage && total > 1000) {
    errors.push('Total rubric score cannot exceed 1000.');
  }
  if (
    (values.scoringModel === RubricScoringModel.PerformanceLevels || values.scoringModel === RubricScoringModel.RatingScale) &&
    values.performanceLevels.filter((level) => level.label.trim()).length < 2
  ) {
    errors.push('Add at least two scoring levels.');
  }
  if (values.scoringModel === RubricScoringModel.Checklist && !values.performanceLevels.length && values.criteria.some((criterion) => criterion.maxMarks !== '1')) {
    errors.push('Checklist items must be worth one point.');
  }

  return errors;
};

const RubricConfigForm: React.FC<RubricConfigFormProps> = ({ editData, onClose }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [activeStep, setActiveStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [submitMode, setSubmitMode] = useState<'draft' | 'publish'>('draft');
  const submitModeRef = useRef<'draft' | 'publish'>('draft');
  const scoringDrafts = useRef<Partial<Record<RubricScoringModel, {
    scores: { title: string; maxMarks: string }[];
    levels: RubricPerformanceLevelFormValue[];
  }>>>({});

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

  React.useEffect(() => {
    scoringDrafts.current = {};
  }, [editData?.id]);

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
          studentDescription: criterion.studentDescription.trim() || null,
          teacherGuidance: criterion.teacherGuidance.trim() || null,
          isRequired: criterion.isRequired,
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
        // Keep existing scopes on edit; new templates belong to the institution.
        visibility: editData?.visibility ?? RubricVisibility.Institution,
        title: values.title.trim(),
        description: values.description.trim() || null,
        evaluationInstructions: values.evaluationInstructions.trim() || null,
        studentInstructions: values.studentInstructions.trim() || null,
        tags: parseRubricTags(values.tags),
        performanceLevels: values.performanceLevels.map((level, index) => ({
          level: levelNumberAt(index, values.performanceLevels.length),
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

  const changeScoringModel = (formik: typeof rubricFormik, value: unknown) => {
    const nextModel = Number(value) as RubricScoringModel;
    const current = formik.values;
    if (!Number.isInteger(nextModel) || nextModel < RubricScoringModel.PointsBased || nextModel > RubricScoringModel.RatingScale) return;
    if (nextModel === current.scoringModel) return;
    scoringDrafts.current[current.scoringModel] = {
      scores: current.criteria.map((criterion) => ({
        title: criterion.title,
        maxMarks: criterion.maxMarks,
      })),
      levels: current.performanceLevels,
    };
    const saved = scoringDrafts.current[nextModel];
    const defaultLevels = nextModel === RubricScoringModel.RatingScale
      ? normalizeLevels(DEFAULT_RATING_LEVELS)
      : nextModel === RubricScoringModel.PerformanceLevels
        ? normalizeLevels(DEFAULT_PERFORMANCE_LEVELS)
        : [];
    const levels = saved?.levels ?? defaultLevels;
    const highestScore = Math.max(...levels.map((level) => Number(level.score)));
    const weight = (index: number) => {
      const previous = Math.round((index * 10000) / current.criteria.length) / 100;
      const next = Math.round(((index + 1) * 10000) / current.criteria.length) / 100;
      return String(Number((next - previous).toFixed(2)));
    };
    const defaultMax = (index: number) => {
      if (nextModel === RubricScoringModel.WeightedPercentage) return weight(index);
      if (nextModel === RubricScoringModel.Checklist) return '1';
      if (nextModel === RubricScoringModel.PointsBased) return '10';
      return String(highestScore);
    };
    formik.setValues({
      ...current,
      scoringModel: nextModel,
      performanceLevels: levels,
      criteria: current.criteria.map((criterion, index) => ({
        ...criterion,
        maxMarks: (criterion.title
          ? saved?.scores.find((score) => score.title === criterion.title)?.maxMarks
          : saved?.scores[index]?.title === criterion.title
            ? saved.scores[index].maxMarks
            : undefined) ?? defaultMax(index),
      })),
    }, false);
    formik.setTouched({ ...formik.touched, criteria: [], performanceLevels: [] }, false);
  };

  const modelGuidance: Record<RubricScoringModel, string> = {
    [RubricScoringModel.PointsBased]: 'Set the maximum points for each criterion (up to 1000). Teachers enter points earned.',
    [RubricScoringModel.WeightedPercentage]: 'Assign each criterion a weight. All weights must add to 100%; teachers enter achievement as a percentage.',
    [RubricScoringModel.PerformanceLevels]: 'Define descriptive levels, then choose a maximum level score for each criterion.',
    [RubricScoringModel.Checklist]: 'Add the items teachers will mark Met or Not met. Each item is worth one point.',
    [RubricScoringModel.RatingScale]: 'Define a shared rating scale from 1 to 10. Teachers choose one rating per criterion.',
  };

  const renderScoringModel = (formik: any) => (
      <Stack spacing={1.5}>
        <SectionPaper
          icon="solar:calculator-bold-duotone"
          title="Scoring Model"
          caption="Choose how the criteria score should be interpreted."
        >
          <Box sx={{ width: '100%', maxWidth: 480 }}>
            <CustomSelect
              label="Scoring Model *"
              options={RUBRIC_SCORING_MODEL_OPTIONS}
              labelKey="label"
              valueKey="value"
              value={formik.values.scoringModel}
              onChange={(value) => changeScoringModel(formik, value)}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {modelGuidance[formik.values.scoringModel as RubricScoringModel]}
          </Typography>
          {editData && formik.values.performanceLevels.length > 0 &&
            formik.values.scoringModel !== RubricScoringModel.PerformanceLevels &&
            formik.values.scoringModel !== RubricScoringModel.RatingScale && (
              <Alert severity="info">
                This existing rubric uses performance levels when teachers score it. Its level settings are shown below.
              </Alert>
            )}
        </SectionPaper>

        {(formik.values.scoringModel === RubricScoringModel.PerformanceLevels ||
          formik.values.scoringModel === RubricScoringModel.RatingScale ||
          formik.values.performanceLevels.length > 0) && (
          <RubricPerformanceLevels formik={formik} />
        )}
      </Stack>
  );

  const renderCriteria = (formik: any) => <RubricCriteriaBuilder formik={formik} />;

  const renderPreview = (formik: any) => {
    const publishErrors = getPublishErrors(formik.values);
    const previewTags = parseRubricTags(formik.values.tags);
    const model = formik.values.scoringModel as RubricScoringModel;

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
          </Stack>
          {previewTags.length > 0 && (
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Tags
              </Typography>
              {previewTags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          )}
        </SectionPaper>
        {publishErrors.length > 0 && (
          <Alert severity="warning">
            <Stack component="ul" sx={{ pl: 2, m: 0 }}>
              {publishErrors.map((error) => (
                <Typography component="li" variant="body2" key={error}>
                  {error}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}
        <SectionPaper
          icon="solar:eye-bold-duotone"
          title="Rubric template preview"
          caption="This is how teachers will see the criteria and scoring choices."
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            {formik.values.title.trim() || 'Untitled rubric'}
          </Typography>
          <RubricTemplatePreview
            scoringModel={model}
            criteria={formik.values.criteria}
            performanceLevels={formik.values.performanceLevels}
          />
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
      completedSteps={Array.from({ length: maxReachedStep }, (_, index) => index).filter(
        (index) => index !== activeStep
      )}
      isStepClickable={(index) => index <= maxReachedStep}
      onStepClick={(index) => setActiveStep(index)}
      validateForwardStepClick
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
          const nextStep = Math.min(activeStep + 1, builderSteps.length - 1);
          setMaxReachedStep((reached) => Math.max(reached, nextStep));
          setActiveStep(nextStep);
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
            {step === 0 ? <RubricBasicInformation formik={formik} /> : null}
            {step === 1 ? (
              <Stack spacing={1.5}>
                {renderScoringModel(formik)}
                {renderCriteria(formik)}
              </Stack>
            ) : null}
            {step === 2 ? renderPreview(formik) : null}
          </Box>
        </Box>
      )}
    />
  );
};

export default RubricConfigForm;
