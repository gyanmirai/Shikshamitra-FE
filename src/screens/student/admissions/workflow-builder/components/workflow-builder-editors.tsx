import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { WorkflowStagePosition } from './workflow-stage-position';
import { AdmissionWorkflowStageDrawer } from '../../admission-workflow-stage-drawer';
import { AdmissionWorkflowTransitionDrawer } from '../../admission-workflow-transition-drawer';

type Props = {
  stageOpen: boolean;
  transitionOpen: boolean;
  editingStage: AdmissionWorkflowStage | null;
  editingTransition: AdmissionWorkflowTransition | null;
  stageToDelete: AdmissionWorkflowStage | null;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  readOnly: boolean;
  insertionSourceId?: string | null;
  insertionSourceLocked?: boolean;
  onChangeInsertionSource?: (id: string) => void;
  onCloseStage: () => void;
  onCloseTransition: () => void;
  onCloseDelete: () => void;
  onSaveStage: (stage: AdmissionWorkflowStage) => void | boolean;
  onSaveTransition: (transition: AdmissionWorkflowTransition) => void;
  onDeleteStage: (stageId: string) => void | boolean;
};

export function WorkflowBuilderEditors({
  stageOpen,
  transitionOpen,
  editingStage,
  editingTransition,
  stageToDelete,
  stages,
  transitions,
  stageTypes,
  forms,
  readOnly,
  insertionSourceId = null,
  insertionSourceLocked = false,
  onChangeInsertionSource,
  onCloseStage,
  onCloseTransition,
  onCloseDelete,
  onSaveStage,
  onSaveTransition,
  onDeleteStage,
}: Props) {
  const connectedTransitions = stageToDelete
    ? transitions.filter(
        (transition) =>
          transition.fromStageId === stageToDelete?.id || transition.toStageId === stageToDelete?.id
      ).length
    : 0;

  return (
    <>
      <AdmissionWorkflowStageDrawer
        open={stageOpen}
        stage={editingStage}
        stageTypes={stageTypes}
        forms={forms}
        stages={stages}
        readOnly={readOnly}
        onClose={onCloseStage}
        onSave={onSaveStage}
        placementField={
          !readOnly &&
          editingStage &&
          stages.length > 0 &&
          !stages.some((stage) => stage.id === editingStage.id) &&
          onChangeInsertionSource ? (
            <WorkflowStagePosition
              stages={stages}
              sourceId={insertionSourceId}
              locked={insertionSourceLocked}
              onChange={onChangeInsertionSource}
            />
          ) : undefined
        }
      />
      <AdmissionWorkflowTransitionDrawer
        open={transitionOpen}
        transition={editingTransition}
        stages={stages}
        transitions={transitions}
        simpleNextStep
        readOnly={readOnly}
        onClose={onCloseTransition}
        onSave={onSaveTransition}
      />
      <ConfirmDialog
        open={Boolean(stageToDelete)}
        onClose={onCloseDelete}
        icon="warning"
        title="Remove workflow stage?"
        content={
          stageToDelete
            ? `Removing ${stageToDelete.name} updates ${connectedTransitions} connected path(s) and reconnects its usual sequence where safe. Stages with special paths or ambiguous connections must be repaired before removal. This change is saved only when you save the draft.`
            : ''
        }
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon="mdi:delete-outline" />}
            onClick={() => {
              if (!stageToDelete) return;
              if (onDeleteStage(stageToDelete.id) !== false) onCloseDelete();
            }}
          >
            Remove stage
          </Button>
        }
      />
    </>
  );
}
