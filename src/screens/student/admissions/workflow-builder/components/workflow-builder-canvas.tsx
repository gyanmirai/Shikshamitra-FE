import type { DragEndEvent } from '@dnd-kit/core';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Card } from '@mui/material';

import { WorkflowStageList } from './workflow-stage-list';
import { WorkflowTransitionList } from './workflow-transition-list';

type Props = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  readOnly: boolean;
  loadingStageTypes: boolean;
  issueCountByStage: Record<string, number>;
  onAddStage: () => void;
  onEditStage: (stage: AdmissionWorkflowStage) => void;
  onDuplicateStage: (stage: AdmissionWorkflowStage) => void;
  onDeleteStage: (stage: AdmissionWorkflowStage) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onAddTransition: () => void;
  onEditTransition: (transition: AdmissionWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
};

export function WorkflowBuilderCanvas({
  stages,
  transitions,
  readOnly,
  loadingStageTypes,
  issueCountByStage,
  onAddStage,
  onEditStage,
  onDuplicateStage,
  onDeleteStage,
  onDragEnd,
  onAddTransition,
  onEditTransition,
  onDeleteTransition,
}: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(320px, 1fr) minmax(320px, 1fr)' },
        overflow: 'hidden',
      }}
    >
      <WorkflowStageList
        stages={stages}
        readOnly={readOnly}
        loadingStageTypes={loadingStageTypes}
        issueCountByStage={issueCountByStage}
        onAdd={onAddStage}
        onEdit={onEditStage}
        onDuplicate={onDuplicateStage}
        onDelete={onDeleteStage}
        onDragEnd={onDragEnd}
      />
      <WorkflowTransitionList
        stages={stages}
        transitions={transitions}
        readOnly={readOnly}
        onAdd={onAddTransition}
        onEdit={onEditTransition}
        onDelete={onDeleteTransition}
      />
    </Card>
  );
}
