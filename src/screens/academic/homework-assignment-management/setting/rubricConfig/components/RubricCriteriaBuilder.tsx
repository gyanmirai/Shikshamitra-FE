import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { useRef } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';
import {
  Box,
  Stack,
  Button,
  Chip,
  TextField,
  Typography,
  FormHelperText,
} from '@mui/material';
import { RubricFormSection } from './RubricFormSection';
import { RubricCriterionActions } from './RubricCriterionActions';
import { CRITERION_BANK } from '../constants';
import { rubricRowNumberAt } from '../performance-level-order';
import {
  canDeleteCriterion,
  addCriterionFromChip,
} from '../criterion-builder-utils';

import type {
  RubricConfigFormValues,
  RubricCriterionFormValue,
  RubricPerformanceLevelFormValue,
} from '../types';

type Formik = FormikProps<RubricConfigFormValues>;
let nextCriterionRowId = 0;

const fieldError = (formik: Formik, path: string) =>
  getIn(formik.touched, path) ? String(getIn(formik.errors, path) || '') : '';

function CriterionRow({
  formik,
  criterion,
  index,
  onDelete,
  criterionInputRef,
}: {
  formik: Formik;
  criterion: RubricCriterionFormValue;
  index: number;
  onDelete: () => void;
  criterionInputRef: (node: HTMLInputElement | null) => void;
}) {
  const path = (name: keyof RubricCriterionFormValue) => `criteria[${index}].${name}`;
  const rowNumber = rubricRowNumberAt(index);
  const isChecklist = formik.values.scoringModel === RubricScoringModel.Checklist;
  const hasScoringLevels = formik.values.performanceLevels.length > 0;
  const scoreError = fieldError(formik, path('maxMarks'));
  const titleError = fieldError(formik, path('title'));

  const criterionField = (
    <TextField
      fullWidth
      size="small"
      label="Criterion *"
      name={path('title')}
      value={criterion.title}
      inputRef={criterionInputRef}
      onBlur={formik.handleBlur}
      onChange={(event) => formik.setFieldValue(path('title'), event.target.value)}
      error={Boolean(titleError)}
      helperText={titleError || ' '}
      sx={{
        gridArea: 'title',
        minWidth: 0,
        '& .MuiFormHelperText-root': { minHeight: '1.25em', mx: 0, whiteSpace: 'nowrap' },
      }}
    />
  );

  const scoreField =
    isChecklist && !hasScoringLevels ? null : hasScoringLevels ? (
      <CustomSelect
        label="Max Score *"
        options={formik.values.performanceLevels
          .filter((level: RubricPerformanceLevelFormValue) => level.score !== '')
          .map((level: RubricPerformanceLevelFormValue) => ({
            label: level.label ? `${level.label} (${level.score})` : level.score,
            value: level.score,
          }))}
        labelKey="label"
        valueKey="value"
        value={criterion.maxMarks}
        onBlur={() => formik.setFieldTouched(path('maxMarks'), true)}
        onChange={(value) => formik.setFieldValue(path('maxMarks'), String(value))}
        error={Boolean(scoreError)}
        helperText={scoreError || ' '}
        formControlProps={{
          fullWidth: true,
          sx: {
            maxWidth: 'unset',
            gridArea: 'max',
            minWidth: 0,
            '& .MuiFormHelperText-root': { minHeight: '1.25em' },
          },
        }}
      />
    ) : (
      <TextField
        fullWidth
        size="small"
        type="number"
        label={
          formik.values.scoringModel === RubricScoringModel.WeightedPercentage
            ? 'Weight % *'
            : 'Max Points *'
        }
        name={path('maxMarks')}
        value={criterion.maxMarks}
        inputProps={{
          min: formik.values.scoringModel === RubricScoringModel.WeightedPercentage ? 0.01 : 0.5,
          max: formik.values.scoringModel === RubricScoringModel.WeightedPercentage ? 100 : 1000,
          step: formik.values.scoringModel === RubricScoringModel.WeightedPercentage ? 0.01 : 0.5,
        }}
        onBlur={formik.handleBlur}
        onChange={(event) => formik.setFieldValue(path('maxMarks'), event.target.value)}
        error={Boolean(scoreError)}
        helperText={scoreError || ' '}
        sx={{ gridArea: 'max', minWidth: 0, '& .MuiFormHelperText-root': { minHeight: '1.25em' } }}
      />
    );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '36px minmax(0, 1fr) 44px',
          sm: '36px minmax(130px, 1fr) minmax(130px, 1fr) minmax(130px, 1fr) minmax(164px, auto)',
          lg: '36px minmax(150px, 1.1fr) minmax(150px, 1fr) minmax(150px, 0.9fr) minmax(164px, auto)',
        },
        gridTemplateAreas: {
          xs: '"number title actions" ". description ." ". max ." ". student ." ". teacher ."',
          sm: '"number title description max actions" ". student teacher . ."',
          lg: '"number title description max actions" ". student teacher . ."',
        },
        alignItems: 'start',
        columnGap: 1,
        rowGap: 1.25,
        py: 1,
      }}
    >
      <Box
        component="span"
        sx={{
          gridArea: 'number',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          justifySelf: 'center',
          borderRadius: '50%',
          border: 1,
          borderColor: 'divider',
          bgcolor: 'action.selected',
          color: 'text.primary',
          typography: 'subtitle2',
        }}
      >
        {rowNumber}
      </Box>
      {criterionField}
      <TextField
        fullWidth
        size="small"
        label="Description"
        name={path('description')}
        value={criterion.description}
        onBlur={formik.handleBlur}
        onChange={(event) => formik.setFieldValue(path('description'), event.target.value)}
        sx={{ gridArea: 'description', minWidth: 0 }}
      />
      {scoreField}
      <Box sx={{ gridArea: 'student', minWidth: 0 }}>
        <TextField
          fullWidth
          size="small"
          label="Student-Facing Description"
          name={path('studentDescription')}
          value={criterion.studentDescription}
          onBlur={formik.handleBlur}
          onChange={(event) => formik.setFieldValue(path('studentDescription'), event.target.value)}
        />
      </Box>
      <Box sx={{ gridArea: 'teacher', minWidth: 0 }}>
        <TextField
          fullWidth
          size="small"
          label="Teacher Guidance"
          name={path('teacherGuidance')}
          value={criterion.teacherGuidance}
          onBlur={formik.handleBlur}
          onChange={(event) => formik.setFieldValue(path('teacherGuidance'), event.target.value)}
        />
      </Box>
      <Box sx={{ gridArea: 'actions', minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <RubricCriterionActions
          criterionNumber={rowNumber}
          isRequired={criterion.isRequired}
          canDelete={canDeleteCriterion(formik.values.criteria.length)}
          onRequiredChange={(isRequired) => formik.setFieldValue(path('isRequired'), isRequired)}
          onDelete={onDelete}
        />
      </Box>
    </Box>
  );
}

export function RubricCriteriaBuilder({ formik }: { formik: Formik }) {
  const pendingFocusId = useRef<string | null>(null);
  const criteria = formik.values.criteria;
  const isChecklist = formik.values.scoringModel === RubricScoringModel.Checklist;
  const clearTouchedCriteria = () => formik.setTouched({ ...formik.touched, criteria: [] }, false);

  const createCriterion = (title = ''): RubricCriterionFormValue => {
    const maxMarks = isChecklist
      ? '1'
      : formik.values.scoringModel === RubricScoringModel.WeightedPercentage
        ? ''
        : formik.values.scoringModel === RubricScoringModel.PointsBased
          ? '10'
          : String(
              Math.max(
                0,
                ...formik.values.performanceLevels.map((level) => Number(level.score) || 0)
              )
            );
    nextCriterionRowId += 1;
    return {
      id: `new-criterion-${nextCriterionRowId}`,
      title,
      description: '',
      maxMarks,
      studentDescription: '',
      teacherGuidance: '',
      isRequired: true,
    };
  };

  const addCriterion = () => {
    const criterion = createCriterion();
    pendingFocusId.current = criterion.id;
    formik.setFieldValue('criteria', [...criteria, criterion]);
    clearTouchedCriteria();
  };

  const addQuickCriterion = (title: string) => {
    const next = addCriterionFromChip(criteria, title, createCriterion);
    const changed = next !== criteria;
    if (!changed) return;
    const added = next.find((criterion, index) => criterion.id !== criteria[index]?.id);
    if (added) pendingFocusId.current = added.id;
    formik.setFieldValue('criteria', next);
    clearTouchedCriteria();
  };

  const deleteCriterion = (id: string) => {
    if (!canDeleteCriterion(criteria.length)) return;
    formik.setFieldValue(
      'criteria',
      criteria.filter((criterion) => criterion.id !== id)
    );
    clearTouchedCriteria();
  };

  const listError = getIn(formik.touched, 'criteria') && getIn(formik.errors, 'criteria');
  const modelGuidance =
    formik.values.scoringModel === RubricScoringModel.WeightedPercentage
      ? 'Assign a percentage weight to every criterion; weights must total 100%.'
      : isChecklist
        ? 'Add the items teachers will mark Met or Not met.'
        : 'Add the criteria teachers will score during evaluation.';

  return (
    <RubricFormSection
      icon="solar:checklist-minimalistic-bold-duotone"
      title={isChecklist ? 'Checklist Items' : 'Criteria Builder'}
      caption={modelGuidance}
      action={
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon="mdi:plus" />}
          aria-label={isChecklist ? 'Add Item' : 'Add Criterion'}
          onClick={addCriterion}
        >
          {isChecklist ? 'Item' : 'Criterion'}
        </Button>
      }
    >
      <Stack spacing={1.5}>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {CRITERION_BANK.map((name) => {
            const isUsed = criteria.some(
              (criterion) => criterion.title.trim().toLocaleLowerCase() === name.toLocaleLowerCase()
            );
            return (
              <Chip
                key={name}
                size="small"
                label={name}
                variant="outlined"
                disabled={isUsed}
                onClick={() => addQuickCriterion(name)}
                sx={{ borderRadius: 1 }}
              />
            );
          })}
        </Stack>
        {typeof listError === 'string' && <FormHelperText error>{listError}</FormHelperText>}
        {formik.values.scoringModel === RubricScoringModel.WeightedPercentage && (
          <Typography variant="body2" color="text.secondary">
            Total weight:{' '}
            {criteria.reduce((sum, item) => sum + (Number(item.maxMarks) || 0), 0).toFixed(2)}% /
            100%
          </Typography>
        )}
        <Stack spacing={0.5}>
          {criteria.map((criterion, index) => (
            <CriterionRow
              key={criterion.id}
              formik={formik}
              criterion={criterion}
              index={index}
              onDelete={() => deleteCriterion(criterion.id)}
              criterionInputRef={(node) => {
                if (node && pendingFocusId.current === criterion.id) {
                  node.focus();
                  node.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
                  pendingFocusId.current = null;
                }
              }}
            />
          ))}
        </Stack>
      </Stack>
    </RubricFormSection>
  );
}
