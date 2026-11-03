'use client';

import { useState } from 'react';
import { Alert, Stack, Button, Typography } from '@mui/material';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { buildScoringPreview } from '../rubricScoringPreview';
import RubricScoreSummary from '../../../marksAndFeedback/rubricScoreSummary';
import RubricCriterionScoring from '../../../marksAndFeedback/rubricCriterionScoring';
import {
  calculateTotalMarks,
  validateCriterionValues,
} from '../../../marksAndFeedback/rubricEvaluationUtils';

import type { RubricConfigFormValues } from '../types';
import type { CriterionEvaluationValues } from '../../../marksAndFeedback/rubricEvaluationTypes';

export function RubricScoringPreview({ values }: { values: RubricConfigFormValues }) {
  const rubric = buildScoringPreview(values);
  const [scores, setScores] = useState<CriterionEvaluationValues>({});
  const [remarks, setRemarks] = useState('');
  const [resetCount, setResetCount] = useState(0);
  // Unscored trial fields are optional; entered scores use the evaluation's validation rules.
  const invalidScore = validateCriterionValues(
    {
      ...rubric,
      criteria: rubric.criteria.map((criterion) => ({ ...criterion, isRequired: false })),
    },
    scores
  );
  const totalMarks = calculateTotalMarks(scores);
  const unit =
    rubric.scoringModel === RubricScoringModel.WeightedPercentage
      ? '%'
      : rubric.scoringModel === RubricScoringModel.Checklist
        ? ' items met'
        : '';

  if (!rubric.criteria.length) {
    return <Typography variant="body2">Add a criterion to preview the rubric.</Typography>;
  }

  return (
    <Stack
      spacing={2}
      sx={{ minWidth: 0 }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          event.preventDefault();
        }
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Try scoring and feedback here. Preview entries are not saved.
        </Typography>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          onClick={() => {
            setScores({});
            setRemarks('');
            setResetCount((count) => count + 1);
          }}
        >
          Reset preview
        </Button>
      </Stack>
      {values.evaluationInstructions && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {values.evaluationInstructions}
        </Typography>
      )}
      {rubric.scoringModel === RubricScoringModel.WeightedPercentage && (
        <Typography variant="body2">Total weight: {rubric.totalMarks} / 100%</Typography>
      )}
      {rubric.scoringModel === RubricScoringModel.Checklist && !rubric.performanceLevels.length && (
        <Typography variant="body2">Checklist items: {rubric.criteria.length}</Typography>
      )}
      <RubricCriterionScoring
        key={resetCount}
        rubric={rubric}
        values={scores}
        onMarksChange={(id, marks) =>
          setScores((current) => ({
            ...current,
            [id]: { comments: current[id]?.comments ?? '', marks },
          }))
        }
        onCommentsChange={(id, comments) =>
          setScores((current) => ({
            ...current,
            [id]: { marks: current[id]?.marks ?? '', comments },
          }))
        }
      />
      <Typography
        role="status"
        aria-label="Preview score"
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          m: -1,
          p: 0,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}
      >
        {invalidScore
          ? 'Correct the invalid score to see the preview total.'
          : `Preview total: ${totalMarks} / ${rubric.totalMarks}${unit}`}
      </Typography>
      {invalidScore ? (
        <Alert severity="warning">Check the score for {invalidScore.title}.</Alert>
      ) : (
        <RubricScoreSummary
          totalMarks={totalMarks}
          maxMarks={rubric.totalMarks}
          scoringModel={rubric.scoringModel}
          remarks={remarks}
          onRemarksChange={setRemarks}
        />
      )}
    </Stack>
  );
}
