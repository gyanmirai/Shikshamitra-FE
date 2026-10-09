import type { AdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

import { Grid, Stack, Switch, TextField, FormControlLabel } from '@mui/material';

import { WorkflowSettingLabel } from './workflow-setting-label';

type Props = {
  policy: AdmissionAssessmentPolicy;
  readOnly: boolean;
  onChange: (change: Partial<AdmissionAssessmentPolicy>) => void;
};

export function WorkflowAssessmentOptions({ policy, readOnly, onChange }: Props) {
  const invalidAttempts =
    !Number.isInteger(policy.maxAttempts) || policy.maxAttempts < 1 || policy.maxAttempts > 10;
  const options = [
    {
      field: 'schedulingEnabled',
      label: 'Schedule an entrance exam',
      help: 'Book an exam session before recording the assessment result. Turn off to record a result directly.',
    },
    {
      field: 'attendanceRequired',
      label: 'Require attendance',
      help: 'Record whether the applicant attended before completing the assessment.',
    },
    {
      field: 'scoringEnabled',
      label: 'Calculate the result from marks',
      help: 'Turn off to let authorized staff record the assessment outcome directly.',
    },
  ] as const;

  return (
    <Stack spacing={2}>
      {options.map(({ field, label, help }) => (
        <Stack key={field}>
          <FormControlLabel
            label={<WorkflowSettingLabel label={label} help={help} />}
            control={
              <Switch
                size="small"
                slotProps={{ input: { 'aria-label': label } }}
                checked={policy[field]}
                disabled={readOnly}
                onChange={(_, value) => onChange({ [field]: value })}
              />
            }
          />
        </Stack>
      ))}
      {policy.scoringEnabled && (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Total marks *"
              disabled={readOnly}
              value={policy.totalMarks}
              onChange={(event) => onChange({ totalMarks: Number(event.target.value) })}
              slotProps={{ htmlInput: { min: 0.01, max: 10000, step: 'any' } }}
              error={policy.totalMarks <= 0 || policy.totalMarks > 10000}
              helperText={
                policy.totalMarks <= 0 || policy.totalMarks > 10000
                  ? 'Enter a value greater than 0, up to 10,000.'
                  : undefined
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={
                <WorkflowSettingLabel
                  label="Passing marks *"
                  help="An equal or higher score passes."
                />
              }
              disabled={readOnly}
              value={policy.passingMarks}
              onChange={(event) => onChange({ passingMarks: Number(event.target.value) })}
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: policy.totalMarks,
                  step: 'any',
                  'aria-label': 'Passing marks *',
                },
              }}
              error={policy.passingMarks < 0 || policy.passingMarks > policy.totalMarks}
              helperText={
                policy.passingMarks < 0 || policy.passingMarks > policy.totalMarks
                  ? 'Use a value between 0 and total marks.'
                  : undefined
              }
            />
          </Grid>
        </Grid>
      )}
      <TextField
        fullWidth
        size="small"
        type="number"
        label={
          <WorkflowSettingLabel
            label="Maximum attempts *"
            help="Includes the first assessment. Choose 1 to disable retakes; maximum 10."
          />
        }
        disabled={readOnly}
        value={policy.maxAttempts}
        onChange={(event) => onChange({ maxAttempts: Number(event.target.value) })}
        slotProps={{
          htmlInput: { min: 1, max: 10, step: 1, 'aria-label': 'Maximum attempts *' },
        }}
        error={invalidAttempts}
        helperText={invalidAttempts ? 'Enter a whole number from 1 to 10.' : undefined}
      />
    </Stack>
  );
}
