import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { useRef } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Chip,
  Stack,
  Button,
  Typography,
  FormHelperText,
} from '@mui/material';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { CRITERION_BANK } from '../constants';
import { RubricFormSection } from './RubricFormSection';
import { RubricCriterionRow } from './RubricCriterionRow';
import {
  canDeleteCriterion,
  addCriterionFromChip,
} from '../criterion-builder-utils';

import type {
  RubricConfigFormValues,
  RubricCriterionFormValue,
  } from '../types';

type Formik = FormikProps<RubricConfigFormValues>;
let nextCriterionRowId = 0;

export function RubricCriteriaBuilder({ formik }: { formik: Formik }) {
  const pendingFocusId = useRef<string | null>(null);
  const {criteria} = formik.values;
  const isChecklist = formik.values.scoringModel === RubricScoringModel.Checklist;
  const clearTouchedCriteria = () => formik.setTouched({ ...formik.touched, criteria: [] }, false);

  const createCriterion = (title = ''): RubricCriterionFormValue => {
    const points = isChecklist
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
      ...(formik.values.scoringModel === RubricScoringModel.PerformanceLevels ? {} :
        formik.values.scoringModel === RubricScoringModel.WeightedPercentage ? { weight: points } : { points }),
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
            {criteria.reduce((sum, item) => sum + (Number(item.weight) || 0), 0).toFixed(2)}% /
            100%
          </Typography>
        )}
        <Stack spacing={0.5}>
          {criteria.map((criterion, index) => (
            <RubricCriterionRow
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
