import type { ReactNode } from 'react';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Card } from '@mui/material';

import { WorkflowStageList } from './workflow-stage-list';

type Props = {
  dirty?: boolean;
  footerActions: ReactNode;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  readOnly: boolean;
  loadingStageTypes: boolean;
  issueCountByStage: Record<string, number>;
  onAddStage: () => void;
  onEditStage: (stage: AdmissionWorkflowStage) => void;
  onDuplicateStage: (stage: AdmissionWorkflowStage) => void;
  onDeleteStage: (stage: AdmissionWorkflowStage) => void;
  onAddTransition: (stage: AdmissionWorkflowStage) => void;
  onEditTransition: (transition: AdmissionWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
};

export function WorkflowBuilderCanvas({
  dirty,
  footerActions,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  stages,
  transitions,
  readOnly,
  loadingStageTypes,
  issueCountByStage,
  onAddStage,
  onEditStage,
  onDuplicateStage,
  onDeleteStage,
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
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <WorkflowStageList
        dirty={dirty}
        footerActions={footerActions}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        stages={stages}
        transitions={transitions}
        readOnly={readOnly}
        loadingStageTypes={loadingStageTypes}
        issueCountByStage={issueCountByStage}
        onAdd={onAddStage}
        onEdit={onEditStage}
        onDuplicate={onDuplicateStage}
        onDelete={onDeleteStage}
        onAddPath={onAddTransition}
        onEditPath={onEditTransition}
        onDeletePath={onDeleteTransition}
      />
    </Card>
  );
}
