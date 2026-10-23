'use client';

import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

type Criterion = {
  title: string;
  description?: string | null;
  studentDescription?: string | null;
  teacherGuidance?: string | null;
  points?: number | string | null;
  weight?: number | string | null;
};

type Level = {
  level?: number;
  label: string;
  score: number | string;
  studentLabel?: string | null;
  description?: string | null;
};

type Props = {
  scoringModel: RubricScoringModel;
  criteria: Criterion[];
  performanceLevels: Level[];
};

export function RubricTemplatePreview({ scoringModel, criteria, performanceLevels }: Props) {
  const levels = [...performanceLevels]
    .filter((level) => level.label.trim() && Number.isFinite(Number(level.score)))
    .sort((first, second) => (second.level ?? 0) - (first.level ?? 0));
  const showsLevels = levels.length > 0;

  if (criteria.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Add a criterion to preview the rubric.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">
        {scoringModel === RubricScoringModel.WeightedPercentage
          ? `Total weight: ${Number(criteria.reduce((sum, criterion) => sum + (Number(criterion.weight) || 0), 0).toFixed(2))} / 100%`
          : scoringModel === RubricScoringModel.Checklist && !showsLevels
            ? `Checklist items: ${criteria.length}`
            : null}
      </Typography>
      {criteria.map((criterion, index) => {
        const name = criterion.title.trim() || `Criterion ${index + 1}`;
        const max =
          scoringModel === RubricScoringModel.PerformanceLevels
            ? Math.max(0, ...levels.map((level) => Number(level.score)))
            : Number(criterion.points ?? criterion.weight);
        const availableLevels = levels.filter((level) => Number(level.score) <= max);

        return (
          <FormSectionCard
            key={`${name}-${index}`}
            title={name}
            icon="mdi:clipboard-check-outline"
            descriptionTooltip="Review this criterion and its scoring choices and guidance."
          >
            <Stack spacing={1.5}>
              <Box sx={{ minWidth: 0 }}>
                {criterion.description && (
                  <Typography variant="body2" color="text.secondary">
                    {criterion.description}
                  </Typography>
                )}
                {criterion.studentDescription && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Student guidance: {criterion.studentDescription}
                  </Typography>
                )}
              </Box>

              {showsLevels && availableLevels.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                    gap: 1,
                  }}
                >
                  {availableLevels.map((level, levelIndex) => (
                    <Paper
                      key={`${level.label}-${level.score}-${levelIndex}`}
                      variant="outlined"
                      sx={{ p: 1.25, borderRadius: 1, bgcolor: 'background.neutral' }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {level.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {scoringModel === RubricScoringModel.RatingScale
                          ? `Rating ${level.score}`
                          : `${level.score} ${Number(level.score) === 1 ? 'point' : 'points'}`}
                      </Typography>
                      {level.studentLabel && level.studentLabel !== level.label && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Student label: {level.studentLabel}
                        </Typography>
                      )}
                      {level.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {level.description}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              ) : showsLevels ? (
                <Typography variant="body2" color="text.secondary">
                  No level is available within this criterion&apos;s maximum score.
                </Typography>
              ) : scoringModel === RubricScoringModel.Checklist ? (
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip label="Met · 1" variant="outlined" sx={{ borderRadius: 1 }} />
                  <Chip label="Not met · 0" variant="outlined" sx={{ borderRadius: 1 }} />
                </Stack>
              ) : scoringModel === RubricScoringModel.PerformanceLevels ||
                scoringModel === RubricScoringModel.RatingScale ? (
                <Typography variant="body2" color="text.secondary">
                  Add scoring levels to show the teacher&apos;s choices.
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {scoringModel === RubricScoringModel.WeightedPercentage
                    ? `Weight ${criterion.weight}%. Teacher enters achievement from 0 to 100%.`
                    : `Teacher enters points earned from 0 to ${criterion.points || 0}.`}
                </Typography>
              )}

              {criterion.teacherGuidance && (
                <Typography variant="caption" color="text.secondary">
                  Teacher guidance: {criterion.teacherGuidance}
                </Typography>
              )}
            </Stack>
          </FormSectionCard>
        );
      })}
    </Stack>
  );
}
