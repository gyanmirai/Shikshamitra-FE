import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';

import { AdmissionWorkflowDialog } from '../admission-workflow-dialog';
import { useAdmissionDefinitionOptions } from '../use-admission-definition-options';

import type { useWorkflowListActions } from './use-workflow-list-actions';

type Actions = ReturnType<typeof useWorkflowListActions>;

const defaultWorkflowCopyName = (name: string | undefined) => {
  if (!name) return '';
  const suffix = ' Copy';
  return `${name.trim().slice(0, 128 - suffix.length).trimEnd()}${suffix}`;
};

const confirmationDetails = {
  delete: {
    title: 'Delete Workflow Draft?',
    label: 'Delete',
    icon: GlobalIcons.delete,
    description: (workflow: AdmissionWorkflow) =>
      `Are you sure you want to delete '${workflow.name}'? This permanently removes the unused draft and its stage configuration.`,
  },
  reopen: {
    title: 'Re-Open Workflow?',
    label: 'Re-open',
    icon: 'mdi:archive-arrow-up-outline',
    description: (workflow: AdmissionWorkflow) =>
      `Re-open ${workflow.name} (version ${workflow.version}) with its published content kept read-only. It returns to Published unless it was already Superseded or another published version exists; in those cases it remains Superseded. Offerings stay unchanged.`,
  },
  archive: {
    title: 'Archive Workflow?',
    label: 'Archive',
    icon: 'mdi:archive-outline',
    description: () => 'Archived Workflows Cannot Be Selected for New Admission Offerings.',
  },
  createVersion: {
    title: 'Create New Version?',
    label: 'Create New Version',
    icon: 'mdi:file-plus-outline',
    description: (workflow: AdmissionWorkflow) =>
      `Create a new draft version of '${workflow.name}'? Admissions already underway will continue on their current workflow version.`,
  },
  publish: {
    title: 'Publish Workflow?',
    label: 'Publish Workflow',
    icon: GlobalIcons.publish,
    description: (workflow: AdmissionWorkflow) =>
      `Publish '${workflow.name}' (version ${workflow.version}) for use in admission offerings?`,
  },
};

export function WorkflowListDialogs({ actions }: { actions: Actions }) {
  const { fetchRegistrationForms } = useAdmissionDefinitionOptions(actions.createDialog.value);
  const pending = actions.pendingConfirmation;
  const deleting = pending?.action === 'delete';
  const reopening = pending?.action === 'reopen';
  const busy = actions.confirmationBusy;
  const details = confirmationDetails[pending?.action ?? 'archive'];
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
        submitLabel="Clone Draft"
        initialValues={{
          name: defaultWorkflowCopyName(actions.cloneSource?.name),
          code: '',
          description: actions.cloneSource?.description ?? '',
        }}
        onSave={actions.clone}
      />
      <ConfirmDialog
        open={Boolean(pending)}
        onClose={actions.closeConfirmation}
        disableCancel={busy}
        disableEscapeKeyDown={busy}
        icon={deleting ? 'error' : reopening ? 'info' : 'warning'}
        title={details.title}
        content={
          <Stack spacing={1.5}>
            <Typography variant="body2">
              {pending && details.description(pending.workflow)}
            </Typography>
            {actions.confirmationNotice && (
              <StudentFeedback notificationKey="STU-0621" presentation="inline" severity="warning">
                {actions.confirmationNotice}
              </StudentFeedback>
            )}
          </Stack>
        }
        action={
          <LoadingButton
            type="button"
            size="small"
            variant="contained"
            color={deleting ? 'error' : 'inherit'}
            loading={busy}
            loadingPosition="center"
            startIcon={<Iconify icon={details.icon} />}
            onClick={actions.confirm}
          >
            {details.label}
          </LoadingButton>
        }
      />
    </>
  );
}
