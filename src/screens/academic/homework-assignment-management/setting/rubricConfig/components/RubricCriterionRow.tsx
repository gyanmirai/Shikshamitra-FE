import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { Box, TextField } from '@mui/material';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { rubricRowNumberAt } from '../performance-level-order';
import { canDeleteCriterion } from '../criterion-builder-utils';
import { RubricCriterionActions } from './RubricCriterionActions';
import { RubricCriterionScoreField } from './RubricCriterionScoreField';

import type { RubricConfigFormValues, RubricCriterionFormValue } from '../types';

type Formik = FormikProps<RubricConfigFormValues>;
const fieldError = (formik: Formik, path: string) =>
  getIn(formik.touched, path) ? String(getIn(formik.errors, path) || '') : '';

export function RubricCriterionRow({
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
  const isPerformance = formik.values.scoringModel === RubricScoringModel.PerformanceLevels;
  const showsScore = !isPerformance && !(isChecklist && !hasScoringLevels);
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

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '36px minmax(0, 1fr) 44px',
          sm: showsScore
            ? '36px repeat(3, minmax(130px, 1fr)) minmax(164px, auto)'
            : '36px repeat(2, minmax(0, 1fr)) minmax(164px, auto)',
          lg: showsScore
            ? '36px minmax(150px, 1.1fr) minmax(150px, 1fr) minmax(150px, 0.9fr) minmax(164px, auto)'
            : '36px repeat(2, minmax(0, 1fr)) minmax(164px, auto)',
        },
        gridTemplateAreas: {
          xs: showsScore
            ? '"number title actions" ". description ." ". max ." ". student ." ". teacher ."'
            : '"number title actions" ". description ." ". student ." ". teacher ."',
          sm: showsScore
            ? '"number title description max actions" ". student teacher . ."'
            : '"number title description actions" ". student teacher ."',
          lg: showsScore
            ? '"number title description max actions" ". student teacher . ."'
            : '"number title description actions" ". student teacher ."',
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
      <RubricCriterionScoreField formik={formik} criterion={criterion} index={index} />
      <TextField
        sx={{ gridArea: 'student', minWidth: 0 }}
        fullWidth
        size="small"
        label="Student-facing description"
        name={path('studentDescription')}
        value={criterion.studentDescription}
        onBlur={formik.handleBlur}
        onChange={(event) => formik.setFieldValue(path('studentDescription'), event.target.value)}
      />
      <TextField
        sx={{ gridArea: 'teacher', minWidth: 0 }}
        fullWidth
        size="small"
        label="Teacher guidance"
        name={path('teacherGuidance')}
        value={criterion.teacherGuidance}
        onBlur={formik.handleBlur}
        onChange={(event) => formik.setFieldValue(path('teacherGuidance'), event.target.value)}
      />
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
