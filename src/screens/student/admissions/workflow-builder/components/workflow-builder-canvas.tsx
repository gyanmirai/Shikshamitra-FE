import type { DragEndEvent } from '@dnd-kit/core';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Box, Card } from '@mui/material';

import { WorkflowStageList } from './workflow-stage-list';
import { WorkflowJourneyMap } from './workflow-journey-map';

type Props = {
  view: 'configure' | 'map';
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
  onAddTransition: (stage: AdmissionWorkflowStage) => void;
  onEditTransition: (transition: AdmissionWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
};

export function WorkflowBuilderCanvas({
  view,
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
        flex: { xs: 'none', md: 1 },
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      {view === 'map' ? (
        <Box
          role="tabpanel"
          id="workflow-builder-map-panel"
          aria-labelledby="workflow-builder-map-tab"
          sx={{ flex: 1, minHeight: 0, display: 'flex' }}
        >
          <WorkflowJourneyMap
            stages={stages}
            transitions={transitions}
            readOnly={readOnly}
            onEditStage={onEditStage}
          />
        </Box>
      ) : (
        <Box
          role="tabpanel"
          id="workflow-builder-configure-panel"
          aria-labelledby="workflow-builder-configure-tab"
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            overflow: { xs: 'visible', md: 'hidden' },
          }}
        >
          <WorkflowStageList
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
            onDragEnd={onDragEnd}
          />
        </Box>
      )}
    </Card>
  );
}
