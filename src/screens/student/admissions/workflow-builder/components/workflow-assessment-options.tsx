import type { AdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

import CustomSelect from 'src/components/custom-select';
import { Grid, Stack, Switch, FormControlLabel } from '@mui/material';

import { WorkflowSettingLabel } from './workflow-setting-label';
import { WorkflowAssessmentMarksField } from './workflow-assessment-marks-field';

import type { AssessmentFieldValidation } from '../hooks/use-assessment-field-validation';

type Props = {
  policy: AdmissionAssessmentPolicy;
  readOnly: boolean;
  validation: AssessmentFieldValidation;
  onChange: (change: Partial<AdmissionAssessmentPolicy>) => void;
};

export function WorkflowAssessmentOptions({ policy, readOnly, validation, onChange }: Props) {
  const options = [
    {
      field: 'schedulingEnabled',
      label: 'Schedule an Entrance Exam',
      help: 'Book an exam session before recording the assessment result. Turn off to record a result directly.',
    },
    {
      field: 'attendanceRequired',
      label: 'Require Attendance',
      help: 'Record whether the applicant attended before completing the assessment.',
    },
    {
      field: 'scoringEnabled',
      label: 'Calculate the Result From Marks',
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
                onChange={(_, value) =>
                  onChange({
                    [field]: value,
                    ...(field === 'scoringEnabled' && !value && policy.version === 2
                      ? { scoringMode: 'total' as const }
                      : {}),
                  })
                }
              />
            }
          />
        </Stack>
      ))}
      <Grid container spacing={1}>
        {policy.scoringEnabled && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              size="small"
              fullWidth
              required
              label="Scoring Method"
              value={policy.version === 2 ? (policy.scoringMode ?? 'total') : 'total'}
              disabled={readOnly}
              options={[
                { value: 'total', label: 'Total Marks' },
                { value: 'subjects', label: 'Subject-Wise Marks' },
              ]}
              onChange={(value) =>
                onChange({
                  version: 2,
                  scoringMode: value as 'total' | 'subjects',
                  classProfiles: policy.classProfiles ?? [],
                })
              }
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: policy.scoringEnabled ? 6 : 12 }}>
          <WorkflowAssessmentMarksField
            label={
              <WorkflowSettingLabel
                label="Maximum Attempts"
                help="Includes the first assessment. Choose 1 to disable retakes; maximum 10."
              />
            }
            ariaLabel="Maximum Attempts *"
            fieldKey="maxAttempts"
            validation={validation}
            disabled={readOnly}
            value={policy.maxAttempts}
            max={10}
            positive
            integer
            onChange={(value) => onChange({ maxAttempts: value ?? 0 })}
            errorMessage="Enter a whole number from 1 to 10."
          />
        </Grid>
      </Grid>
      {policy.scoringEnabled && !(policy.version === 2 && policy.scoringMode === 'subjects') && (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <WorkflowAssessmentMarksField
              label="Total Marks"
              ariaLabel="Total Marks *"
              fieldKey="totalMarks"
              validation={validation}
              disabled={readOnly}
              value={policy.totalMarks}
              max={10000}
              positive
              onChange={(value) => onChange({ totalMarks: value ?? 0 })}
              errorMessage="Enter a value greater than 0, up to 10,000."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <WorkflowAssessmentMarksField
              ariaLabel="Passing Marks *"
              fieldKey="passingMarks"
              validation={validation}
              label={
                <WorkflowSettingLabel
                  label="Passing Marks"
                  help="An equal or higher score passes."
                />
              }
              disabled={readOnly}
              value={policy.passingMarks}
              max={policy.totalMarks}
              onChange={(value) => onChange({ passingMarks: value ?? 0 })}
              errorMessage="Use a value between 0 and total marks."
            />
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
