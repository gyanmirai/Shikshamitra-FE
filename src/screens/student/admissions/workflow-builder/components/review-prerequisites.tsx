import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionReviewPrerequisite } from 'src/redux/student/admissions/admission-review-policy';

import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Checkbox, FormControlLabel } from '@mui/material';

import { getReviewPrerequisiteKind } from '../review-stage-prerequisites';

export function ReviewPrerequisites({
  value,
  stages,
  stageOrder,
  disabled,
  onChange,
}: {
  value: AdmissionReviewPrerequisite[];
  stages: AdmissionWorkflowStage[];
  stageOrder: number;
  disabled: boolean;
  onChange: (value: AdmissionReviewPrerequisite[]) => void;
}) {
  const options = stages.filter(
    (stage) => stage.displayOrder < stageOrder && getReviewPrerequisiteKind(stage)
  );
  const missing = value.filter(
    (item) =>
      !options.some(
        (stage) =>
          stage.code === item.sourceStageCode && getReviewPrerequisiteKind(stage) === item.kind
      )
  );
  return (
    <Stack spacing={1}>
      {!options.length && (
        <StudentFeedback notificationKey="STU-0529" presentation="inline" severity="info">
          Configure earlier Assessment, Document verification, or Eligibility stages to use their
          results here. You can review the application without these prerequisites.
        </StudentFeedback>
      )}
      {options.map((stage) => {
        const checked = value.some((item) => item.sourceStageCode === stage.code);
        return (
          <FormControlLabel
            key={stage.id}
            label={stage.name}
            control={
              <Checkbox
                size="small"
                checked={checked}
                disabled={disabled || (!checked && value.length >= 20)}
                onChange={(_, selected) => {
                  const kind = getReviewPrerequisiteKind(stage);
                  if (kind)
                    onChange(
                      selected
                        ? [...value, { kind, sourceStageCode: stage.code }]
                        : value.filter((item) => item.sourceStageCode !== stage.code)
                    );
                }}
              />
            }
          />
        );
      })}
      {missing.map((item) => (
        <StudentFeedback
          notificationKey="STU-0530"
          presentation="persistent"
          key={item.sourceStageCode}
          severity="error"
          action={
            !disabled && (
              <Button
                size="small"
                onClick={() => onChange(value.filter((entry) => entry !== item))}
              >
                Remove
              </Button>
            )
          }
        >
          {stages.find((stage) => stage.code === item.sourceStageCode)?.name ||
            'A saved prerequisite'}{' '}
          is no longer an earlier configured {item.kind} stage. Choose a valid source.
        </StudentFeedback>
      ))}
    </Stack>
  );
}
