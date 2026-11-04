import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Chip, Grid, Stack, TextField, Typography, InputAdornment } from '@mui/material';

import type { AssignmentFeedbackFormState } from '../hooks/useAssignmentFeedbackForm';

type Props = { isEdit: boolean; state: AssignmentFeedbackFormState };
export default function AssignmentMarksSection({ isEdit, state }: Props) {
  const { formik, totalMarks, obtainedMarks, percentage, busy } = state;
  const marksInputRef = useRef<HTMLInputElement>(null);
  const [activeQuickScore, setActiveQuickScore] = useState<string | null>(null);
  const quickScores = [
    { label: `Full Marks (${totalMarks})`, key: 'full', value: totalMarks },
    {
      label: `Half Marks (${Math.floor(totalMarks / 2)})`,
      key: 'half',
      value: Math.floor(totalMarks / 2),
    },
    { label: 'Zero (0)', key: 'zero', value: 0 },
    {
      label: `Good (${Math.floor(totalMarks * 0.8)})`,
      key: 'good',
      value: Math.floor(totalMarks * 0.8),
    },
  ];

  const handleQuickScore = (key: string, value: number) => {
    if (!isEdit) return;
    setActiveQuickScore(key);
    formik.setFieldValue('marks', value);
  };

  return (
    <FormSectionCard
      title="Evaluation & Marks"
      icon={GlobalIcons.rubricFile}
      descriptionTooltip="The student's obtained marks out of the assignment's total marks. No score is shown until marks have been recorded."
      sx={{ height: 1, minWidth: 0 }}
    >
      {isEdit ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total marks"
              fullWidth
              name="totalMarks"
              disabled
              size="small"
              value={formik.values.totalMarks}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={!!(formik.touched.marks && formik.errors.marks)}>
              <TextField
                label="Obtained marks"
                required
                fullWidth
                type="number"
                name="marks"
                inputRef={marksInputRef}
                placeholder={`0-${totalMarks}`}
                inputProps={{ min: 0, max: formik.values.totalMarks }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.secondary">
                        / {totalMarks}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                onKeyDown={(event) => {
                  if (['e', 'E', '+', '-', '.'].includes(event.key)) event.preventDefault();
                }}
                onBlur={formik.handleBlur}
                onChange={(event) => {
                  const { value } = event.target;
                  setActiveQuickScore(null);
                  if (value === '') {
                    formik.setFieldValue('marks', '');
                    return;
                  }
                  const numericValue = parseInt(value, 10);
                  if (
                    !Number.isNaN(numericValue) &&
                    numericValue <= Number(formik.values.totalMarks)
                  ) {
                    formik.setFieldValue('marks', numericValue);
                  }
                }}
                size="small"
                value={formik.values.marks}
                error={formik.touched.marks && Boolean(formik.errors.marks)}
                helperText={formik.touched.marks && formik.errors.marks}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {quickScores.map((score) => (
                <Chip
                  key={score.key}
                  label={score.label}
                  size="small"
                  variant={activeQuickScore === score.key ? 'filled' : 'outlined'}
                  color={activeQuickScore === score.key ? 'primary' : 'default'}
                  disabled={busy}
                  aria-pressed={activeQuickScore === score.key}
                  onClick={() => handleQuickScore(score.key, score.value)}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Typography variant="caption" color="text.secondary" component="div">
              Obtained marks
            </Typography>
            <Typography variant="body2">
              {obtainedMarks !== null
                ? `${obtainedMarks} / ${totalMarks}`
                : `Not recorded / ${totalMarks}`}
            </Typography>
          </Grid>
          {percentage !== null && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary" component="div">
                Percentage
              </Typography>
              <Typography variant="body2">{percentage}%</Typography>
            </Grid>
          )}
        </Grid>
      )}
    </FormSectionCard>
  );
}
