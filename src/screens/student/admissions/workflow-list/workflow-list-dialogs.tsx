import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { AdmissionWorkflowDialog } from '../admission-workflow-dialog';
import { useAdmissionDefinitionOptions } from '../use-admission-definition-options';

import type { useWorkflowListActions } from './use-workflow-list-actions';

type Actions = ReturnType<typeof useWorkflowListActions>;

export function WorkflowListDialogs({ actions }: { actions: Actions }) {
  const { fetchRegistrationForms } = useAdmissionDefinitionOptions(actions.createDialog.value);
  const pending = actions.pendingConfirmation;
  const deleting = pending?.action === 'delete';
  const reopening = pending?.action === 'reopen';
  const busy =
    actions.archiveState.isLoading ||
    actions.reopenState.isLoading ||
    actions.deleteState.isLoading ||
    actions.confirmationRefreshing;
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
        onClose={() => {
          if (!busy) actions.closeConfirmation();
        }}
        disableCancel={busy}
        disableEscapeKeyDown={busy}
        icon={deleting ? 'error' : reopening ? 'info' : 'warning'}
        title={
          deleting
            ? 'Delete Workflow Draft?'
            : reopening
              ? 'Re-open Workflow?'
              : 'Archive Workflow?'
        }
        content={
          <Stack spacing={1.5}>
            <Typography variant="body2">
              {deleting
                ? 'This permanently removes the unused draft and its stage configuration.'
                : reopening
                  ? `Re-open ${pending?.workflow.name} (version ${pending?.workflow.version}) with its published content kept read-only. It returns to Published unless it was already Superseded or another published version exists; in those cases it remains Superseded. Offerings stay unchanged.`
                  : 'Archived workflows cannot be selected for new admission offerings.'}
            </Typography>
            {actions.confirmationNotice && (
              <Alert severity="warning">{actions.confirmationNotice}</Alert>
            )}
          </Stack>
        }
        action={
          <LoadingButton
            size="small"
            variant="contained"
            color={deleting ? 'error' : 'inherit'}
            loading={busy}
            startIcon={
              <Iconify
                icon={
                  deleting
                    ? 'mdi:delete-outline'
                    : reopening
                      ? 'mdi:archive-arrow-up-outline'
                      : 'mdi:archive-outline'
                }
              />
            }
            onClick={actions.confirm}
          >
            {actions.confirmationRefreshing
              ? 'Checking latest…'
              : deleting
                ? 'Delete'
                : reopening
                  ? 'Re-open'
                  : 'Archive'}
          </LoadingButton>
        }
      />
    </>
  );
}
