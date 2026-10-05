import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Alert, Stack, Button, Typography } from '@mui/material';

import { AdmissionWorkflowDialog } from '../admission-workflow-dialog';
import { useAdmissionDefinitionOptions } from '../use-admission-definition-options';

import type { useWorkflowListActions } from './use-workflow-list-actions';

type Actions = ReturnType<typeof useWorkflowListActions>;

export function WorkflowListDialogs({ actions }: { actions: Actions }) {
  const { fetchRegistrationForms } = useAdmissionDefinitionOptions(actions.createDialog.value);
  const pending = actions.pendingConfirmation;
  const deleting = pending?.action === 'delete';
  return (
    <>
      <AdmissionWorkflowDialog
        open={actions.createDialog.value}
        closeRequestRef={actions.createCloseRef}
        onClose={actions.createDialog.onFalse}
        saving={actions.createState.isLoading || actions.openingCreatedWorkflow}
        showStarterJourney
        closeOnSave={false}
        fetchRegistrationForms={fetchRegistrationForms}
        onSave={actions.create}
      />
      <AdmissionWorkflowDialog
        open={actions.cloneDialog.value}
        onClose={() => {
          actions.cloneDialog.onFalse();
          actions.setCloneSource(null);
        }}
        saving={actions.cloneState.isLoading}
        title="Clone Workflow"
        submitLabel="Clone draft"
        initialValues={{
          name: actions.cloneSource ? `${actions.cloneSource.name} Copy` : '',
          code: '',
          description: actions.cloneSource?.description ?? '',
        }}
        onSave={actions.clone}
      />
      <ConfirmDialog
        open={Boolean(pending)}
        onClose={actions.closeConfirmation}
        icon={deleting ? 'error' : 'warning'}
        title={deleting ? 'Delete workflow draft?' : 'Archive workflow?'}
        content={
          <Stack spacing={1.5}>
            <Typography variant="body2">
              {deleting
                ? 'This permanently removes the unused draft and its stage configuration.'
                : 'Archived workflows cannot be selected for new admission offerings.'}
            </Typography>
            {actions.confirmationNotice && (
              <Alert severity="warning">{actions.confirmationNotice}</Alert>
            )}
          </Stack>
        }
        action={
          <Button
            size="small"
            variant="contained"
            color={deleting ? 'error' : 'warning'}
            disabled={
              actions.archiveState.isLoading ||
              actions.deleteState.isLoading ||
              actions.confirmationRefreshing
            }
            startIcon={<Iconify icon={deleting ? 'mdi:delete-outline' : 'mdi:archive-outline'} />}
            onClick={actions.confirm}
          >
            {actions.confirmationRefreshing ? 'Checking latest…' : deleting ? 'Delete' : 'Archive'}
          </Button>
        }
      />
    </>
  );
}
