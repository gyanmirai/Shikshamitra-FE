import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Box } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { isApplicationStageType } from '../workflow-stage-configuration';

function insertionStages(stages: AdmissionWorkflowStage[]) {
  const ordered = [...stages]
    .filter((stage) => isApplicationStageType(stage.stageType))
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const nonTerminal = ordered.filter((stage) => !stage.isTerminalStage);
  return nonTerminal.length ? nonTerminal : ordered;
}

export function getDefaultStageInsertionSource(
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[]
) {
  const options = insertionStages(stages);
  return (
    options.find(
      (stage) =>
        !stage.isTerminalStage &&
        !transitions.some(
          (transition) => transition.fromStageId === stage.id && transition.isDefault
        )
    )?.id ??
    options.at(-1)?.id ??
    null
  );
}

export function WorkflowStagePosition({
  stages,
  sourceId,
  locked,
  onChange,
}: {
  stages: AdmissionWorkflowStage[];
  sourceId: string | null;
  locked: boolean;
  onChange: (id: string) => void;
}) {
  const options = insertionStages(stages);
  const beforeFinal = options.length > 0 && options.every((stage) => stage.isTerminalStage);
  const label = beforeFinal ? 'Insert Before *' : 'Insert After *';
  return (
    <Box sx={{ px: 2, pt: 2 }}>
      <FormSectionCard
        title="Journey Position"
        icon="mdi:source-branch"
        descriptionTooltip="The Stage Is Inserted at This Position and the Usual Path Is Connected Automatically. Existing Special Paths Are Preserved."
      >
        <ShakingTextField>
          <CustomSelect
            fullWidth
            size="small"
            label={label}
            value={sourceId ?? ''}
            disabled={locked}
            options={options.map((stage) => ({ value: stage.id, label: stage.name }))}
            noOptionsMessage="No Safe Insertion Position Is Available. Review the Existing Journey."
            onChange={(value) => onChange(String(value))}
          />
        </ShakingTextField>
      </FormSectionCard>
    </Box>
  );
}
