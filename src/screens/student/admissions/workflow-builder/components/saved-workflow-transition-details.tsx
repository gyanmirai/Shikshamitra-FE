import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { SavedStageFacts } from './saved-stage-facts';
import { ROUTE_OPERATOR_LABELS } from '../workflow-condition-catalog';
import { getTransitionConditionEditorState } from '../workflow-transition-form';

import type { WorkflowConditionField } from '../workflow-condition-catalog';

export function SavedWorkflowTransitionDetails({
  transition,
  stages,
  conditionFields,
}: {
  transition: AdmissionWorkflowTransition | null;
  stages: AdmissionWorkflowStage[];
  conditionFields: WorkflowConditionField[];
}) {
  if (!transition) return <Typography sx={{ p: 2 }}>No saved route is available.</Typography>;
  const source = stages.find((stage) => stage.id === transition.fromStageId);
  const destination = stages.find((stage) => stage.id === transition.toStageId);
  const condition = getTransitionConditionEditorState(transition.conditionRuleJson);
  const field = conditionFields.find((item) => item.value === condition.conditionField);
  const value =
    field?.choices?.find((choice) => choice.value === condition.conditionValue)?.label ??
    condition.conditionValue;
  return (
    <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <FormSectionCard
        title="Route Details"
        icon={GlobalIcons.admissionDetails}
        descriptionTooltip="The saved source, destination and route order for this workflow version. Viewing does not change the applicant journey."
      >
        <SavedStageFacts
          items={[
            ['From stage', source?.name ?? 'Saved stage unavailable'],
            ['Continue to', destination?.name ?? 'Saved stage unavailable'],
            ['Route type', transition.isDefault ? 'Usual path' : 'Conditional path'],
            ['Route order', transition.priority],
          ]}
        />
      </FormSectionCard>
      <FormSectionCard
        title="Saved Condition"
        icon={GlobalIcons.academicFieldSettings}
        descriptionTooltip="Conditions are shown from the saved rule. Advanced or unsupported rules are retained exactly and are not evaluated or rewritten here."
      >
        {!condition.hasCondition ? (
          <Typography variant="body2">No condition is saved for this route.</Typography>
        ) : condition.preserveCondition ? (
          <Box
            component="pre"
            sx={{ m: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', typography: 'body2' }}
          >
            {transition.conditionRuleJson}
          </Box>
        ) : (
          <SavedStageFacts
            items={[
              ['Rule field', field?.label ?? condition.conditionField],
              [
                'Operator',
                (
                  ROUTE_OPERATOR_LABELS[condition.conditionOperator] ?? condition.conditionOperator
                ).toLowerCase(),
              ],
              ['Value', value || 'No comparison value'],
            ]}
          />
        )}
      </FormSectionCard>
    </Stack>
  );
}
