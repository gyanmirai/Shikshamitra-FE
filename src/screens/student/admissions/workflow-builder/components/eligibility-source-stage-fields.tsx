import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionEligibilityCriterion } from 'src/redux/student/admissions/admission-eligibility-policy';

import CustomSelect from 'src/components/custom-select';
import { Alert, Stack, TextField } from '@mui/material';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

export function EligibilitySourceStageFields({
  value,
  stages,
  stageOrder,
  onChange,
  readOnly,
}: {
  value: AdmissionEligibilityCriterion;
  stages: AdmissionWorkflowStage[];
  stageOrder: number;
  onChange: (value: AdmissionEligibilityCriterion) => void;
  readOnly: boolean;
}) {
  const assessment = value.kind === 'assessment';
  const options = stages.filter(
    (stage) =>
      stage.displayOrder < stageOrder &&
      (assessment
        ? stage.stageType === 2 && readAdmissionAssessmentPolicy(stage.configurationJson)?.enabled
        : stage.stageType === 5 && readAdmissionDocumentPolicy(stage.configurationJson)?.enabled)
  );
  const selectedMissing =
    value.sourceStageCode && !options.some((stage) => stage.code === value.sourceStageCode);
  return (
    <Stack spacing={1}>
      <CustomSelect
        fullWidth
        size="small"
        label={assessment ? 'Earlier assessment stage *' : 'Earlier document stage *'}
        disabled={readOnly}
        value={value.sourceStageCode ?? ''}
        options={[
          { value: '', label: 'Choose a stage' },
          ...options.map((stage) => ({ value: stage.code, label: stage.name })),
          ...(selectedMissing
            ? [{ value: value.sourceStageCode!, label: 'Selected source stage is unavailable' }]
            : []),
        ]}
        onChange={(sourceStageCode) =>
          onChange({ ...value, sourceStageCode: String(sourceStageCode) })
        }
      />
      {!options.length && (
        <Alert severity="info">
          Add and configure an earlier {assessment ? 'assessment' : 'document verification'} stage
          before using this check.
        </Alert>
      )}
      {selectedMissing && (
        <Alert severity="error">
          The saved source stage is unavailable. Choose an earlier configured stage.
        </Alert>
      )}
      {!assessment && (
        <Alert severity="info">
          Checks whether the required documents for this stage are verified, including any waivers
          approved under its document policy.
        </Alert>
      )}
      {assessment && (
        <CustomSelect
          fullWidth
          size="small"
          label="Required assessment outcome"
          value={value.requiredOutcome ?? 'passed'}
          disabled={readOnly}
          options={[
            { value: 'passed', label: 'Passed' },
            { value: 'waived', label: 'Waiver approved' },
          ]}
          onChange={(outcome) =>
            onChange({
              ...value,
              requiredOutcome: outcome === 'waived' ? 'waived' : 'passed',
              minimumPercentage: outcome === 'waived' ? null : value.minimumPercentage,
            })
          }
        />
      )}
      {assessment && value.requiredOutcome !== 'waived' && (
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Minimum score percentage (optional)"
          disabled={readOnly}
          value={value.minimumPercentage ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              minimumPercentage: event.target.value === '' ? null : Number(event.target.value),
            })
          }
          slotProps={{ htmlInput: { min: 0, max: 100, step: 'any' } }}
          helperText="Uses the recorded result from this specific stage."
        />
      )}
    </Stack>
  );
}
