import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

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
  onCloseStage: () => void;
  onCloseTransition: () => void;
  onCloseDelete: () => void;
  onSaveStage: (stage: AdmissionWorkflowStage) => void;
  onSaveTransition: (transition: AdmissionWorkflowTransition) => void;
  onDeleteStage: (stageId: string) => void;
};

export function WorkflowBuilderEditors({ stageOpen, transitionOpen, editingStage, editingTransition, stageToDelete, stages, transitions, stageTypes, forms, readOnly, onCloseStage, onCloseTransition, onCloseDelete, onSaveStage, onSaveTransition, onDeleteStage }: Props) {
  const connectedTransitions = stageToDelete
    ? transitions.filter(
        (transition) =>
          transition.fromStageId === stageToDelete?.id ||
          transition.toStageId === stageToDelete?.id
      ).length
    : 0;

  return (
    <>
      <AdmissionWorkflowStageDrawer open={stageOpen} stage={editingStage} stageTypes={stageTypes} forms={forms} readOnly={readOnly} onClose={onCloseStage} onSave={onSaveStage} />
      <AdmissionWorkflowTransitionDrawer open={transitionOpen} transition={editingTransition} stages={stages} readOnly={readOnly} onClose={onCloseTransition} onSave={onSaveTransition} />
      <ConfirmDialog
        open={Boolean(stageToDelete)}
        onClose={onCloseDelete}
        icon="warning"
        title="Remove workflow stage?"
        content={stageToDelete ? `Removing ${stageToDelete.name} will also remove ${connectedTransitions} connected transition(s). This change is saved only when you save the draft.` : ''}
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon="mdi:delete-outline" />}
            onClick={() => {
              if (!stageToDelete) return;
              onDeleteStage(stageToDelete.id);
              onCloseDelete();
            }}
          >
            Remove stage
          </Button>
        }
      />
    </>
  );
}
