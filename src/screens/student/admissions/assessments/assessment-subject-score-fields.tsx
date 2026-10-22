import type { AssessmentEffectiveProfile } from 'src/redux/student/admissions/admission-assessment-types';

import { Box, Stack, Typography } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import {
  assessmentEnteredTotal,
  assessmentProfileTotal,
  assessmentPassRuleLabels,
} from './assessment-subject-results';

import type { AssessmentSubjectValues } from './assessment-subject-results';

export function AssessmentSubjectScoreFields({
  profile,
  values,
  errors = {},
  disabled,
  onChange,
}: {
  profile: AssessmentEffectiveProfile;
  values: AssessmentSubjectValues;
  errors?: Record<string, string>;
  disabled: boolean;
  onChange: (code: string, value: string) => void;
}) {
  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <Stack spacing={0.25}>
        <Typography variant="subtitle2">{profile.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {assessmentPassRuleLabels[profile.passRule]}
          {profile.passRule !== 'everySubject' ? ` · Passing: ${profile.passingMarks}` : ''}
        </Typography>
      </Stack>
      {errors._profile && (
        <Typography color="error" variant="body2">
          {errors._profile}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {profile.subjects.map((subject) => (
          <NumericFormatCustom
            key={subject.code}
            fullWidth
            required
            size="small"
            prefix=""
            roundToWholeRupees={false}
            name={`subjectScores.${subject.code}`}
            label={`${subject.name} / ${subject.totalMarks}`}
            value={values[subject.code] ?? ''}
            disabled={disabled}
            error={Boolean(errors[subject.code])}
            helperText={
              errors[subject.code] ||
              (profile.passRule !== 'overall' ? `Passing: ${subject.passingMarks}` : undefined)
            }
            onValueChange={({ value }, source) => {
              if (source.source === 'event') onChange(subject.code, value);
            }}
          />
        ))}
      </Box>
      <Typography variant="body2" aria-live="polite">
        Total entered: {assessmentEnteredTotal(profile, values)} / {assessmentProfileTotal(profile)}
      </Typography>
    </Stack>
  );
}
