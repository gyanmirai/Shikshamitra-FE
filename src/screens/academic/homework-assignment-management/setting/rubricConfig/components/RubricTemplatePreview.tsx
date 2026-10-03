'use client';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

type Criterion = {
  title: string;
  description?: string | null;
  studentDescription?: string | null;
  teacherGuidance?: string | null;
  maxMarks: number | string;
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
      {criteria.map((criterion, index) => {
        const name = criterion.title.trim() || `Criterion ${index + 1}`;
        const max = Number(criterion.maxMarks);
        const availableLevels = levels.filter((level) => Number(level.score) <= max);

        return (
          <Paper key={`${name}-${index}`} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Stack spacing={1.5}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {name}
                </Typography>
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
                    ? 'Teacher enters achievement from 0 to 100%.'
                    : `Teacher enters points earned from 0 to ${criterion.maxMarks || 0}.`}
                </Typography>
              )}

              {criterion.teacherGuidance && (
                <Typography variant="caption" color="text.secondary">
                  Teacher guidance: {criterion.teacherGuidance}
                </Typography>
              )}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
