
import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { AdmissionWorkflowDialog } from '../admission-workflow-dialog';

import type { useWorkflowListActions } from './use-workflow-list-actions';

type Actions = ReturnType<typeof useWorkflowListActions>;

export function WorkflowListDialogs({ actions }: { actions: Actions }) {
  const pending = actions.pendingConfirmation;
  const deleting = pending?.action === 'delete';
  return (
    <>
      <AdmissionWorkflowDialog open={actions.createDialog.value} onClose={actions.createDialog.onFalse} saving={actions.createState.isLoading} onSave={actions.create} />
      <AdmissionWorkflowDialog
        open={actions.cloneDialog.value}
        onClose={() => { actions.cloneDialog.onFalse(); actions.setCloneSource(null); }}
        saving={actions.cloneState.isLoading}
        title="Clone Workflow"
        submitLabel="Clone draft"
        initialValues={{
          name: actions.cloneSource ? `${actions.cloneSource.name} Copy` : '',
          code: actions.cloneSource ? `${actions.cloneSource.code}_COPY` : '',
          description: actions.cloneSource?.description ?? '',
        }}
        onSave={actions.clone}
      />
      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => actions.setPendingConfirmation(null)}
        icon={deleting ? 'error' : 'warning'}
        title={deleting ? 'Delete workflow draft?' : 'Archive workflow?'}
        content={deleting ? 'This permanently removes the unused draft and its stage configuration.' : 'Archived workflows cannot be selected for new admission offerings.'}
        action={
          <Button
            size="small"
            variant="contained"
            color={deleting ? 'error' : 'warning'}
            disabled={actions.archiveState.isLoading || actions.deleteState.isLoading}
            startIcon={<Iconify icon={deleting ? 'mdi:delete-outline' : 'mdi:archive-outline'} />}
            onClick={actions.confirm}
          >
            {deleting ? 'Delete' : 'Archive'}
          </Button>
        }
      />
    </>
  );
}
